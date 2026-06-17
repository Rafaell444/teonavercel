import uuid

from django.db import models

from apps.users.models import User


class ConsultationSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)
    booked_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="consultation_slots"
    )

    class Meta:
        ordering = ["date", "start_time"]
        unique_together = ["date", "start_time"]

    def __str__(self):
        status = "Booked" if self.is_booked else "Available"
        return f"{self.date} {self.start_time}-{self.end_time} [{status}]"


class ConsultationBooking(models.Model):
    STATUS_CHOICES = [
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="consultation_bookings")
    slot = models.OneToOneField(ConsultationSlot, on_delete=models.CASCADE, related_name="booking")
    meet_link = models.URLField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Consultation: {self.user.email} on {self.slot.date} at {self.slot.start_time}"
