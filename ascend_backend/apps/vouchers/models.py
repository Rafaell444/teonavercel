import uuid

from django.db import models
from django.utils import timezone

from apps.sessions.models import Session


class Voucher(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed Amount"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=12, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    max_uses = models.PositiveIntegerField(null=True, blank=True, help_text="Leave blank for unlimited")
    times_used = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    applicable_sessions = models.ManyToManyField(
        Session, blank=True, related_name="vouchers",
        help_text="Leave empty to apply to all sessions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} ({self.get_discount_type_display()}: {self.discount_value})"

    @property
    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.valid_from or now > self.valid_until:
            return False
        if self.max_uses and self.times_used >= self.max_uses:
            return False
        return True

    def compute_discount(self, base_price):
        if self.discount_type == "percentage":
            return round(base_price * self.discount_value / 100, 2)
        return min(self.discount_value, base_price)
