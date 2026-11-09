import uuid
from datetime import timedelta

from django.db import models
from django.utils import timezone

from apps.sessions.models import Session, SessionTimeSlot
from apps.users.models import User


EXPIRATION_MAP = {
    3: timedelta(days=45),   # 1.5 months
    4: timedelta(days=60),   # 2 months
    5: timedelta(days=90),   # 3 months
    6: timedelta(days=90),   # 3 months
    7: timedelta(days=150),  # 5 months
}


class Booking(models.Model):
    STATUS_CHOICES = [
        ("Confirmed", "Confirmed"),
        ("Pending", "Pending"),
        ("Cancelled", "Cancelled"),
        ("Expired", "Expired"),
    ]
    FORMAT_CHOICES = [
        ("online", "Online"),
        ("offline", "In-Person"),
    ]
    LANGUAGE_CHOICES = [
        ("ka", "Georgian"),
        ("en", "English"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    session = models.ForeignKey(
        Session, on_delete=models.PROTECT, related_name="bookings"
    )
    num_sessions = models.PositiveSmallIntegerField(default=3)
    sessions_used = models.PositiveSmallIntegerField(default=0)

    date = models.CharField(max_length=50, blank=True, default="")
    time = models.CharField(max_length=20, blank=True, default="")
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default="online")
    # Language the client asked for the sessions to be held in (booking wizard step 5)
    session_language = models.CharField(
        max_length=2, choices=LANGUAGE_CHOICES, default="ka"
    )

    is_package = models.BooleanField(default=False)
    package_duration_months = models.PositiveSmallIntegerField(null=True, blank=True)

    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    voucher_code = models.CharField(max_length=50, blank=True, default="")

    meet_link = models.URLField(blank=True, default="")

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Pending")
    purchased_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} — {self.session.title}"

    @property
    def is_expired(self):
        if self.expires_at and timezone.now() > self.expires_at:
            return True
        return False

    def compute_expiration(self):
        if self.is_package and self.package_duration_months:
            return self.purchased_at + timedelta(days=self.package_duration_months * 30)
        return self.purchased_at + EXPIRATION_MAP.get(
            self.num_sessions, timedelta(days=90)
        )

    def compute_total(self):
        base = self.session.price * self.num_sessions
        return max(base - self.discount_amount, 0)

    def save(self, *args, **kwargs):
        if not self.total:
            self.total = self.compute_total()
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.expires_at:
            self.expires_at = self.compute_expiration()
            Booking.objects.filter(pk=self.pk).update(expires_at=self.expires_at)


class BookingSession(models.Model):
    """Tracks each individual session occurrence within a booking."""
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("missed", "Missed"),
        ("cancelled", "Cancelled"),
    ]
    FORMAT_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="booking_sessions"
    )
    time_slot = models.ForeignKey(
        SessionTimeSlot, null=True, blank=True, on_delete=models.SET_NULL
    )
    session_number = models.PositiveSmallIntegerField(default=1)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default="online")
    meet_link = models.URLField(blank=True, default="")
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="scheduled")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["session_number"]

    def __str__(self):
        return f"Booking {self.booking_id} — Session #{self.session_number}"
