import uuid

from django.db import models


class NotificationLog(models.Model):
    TYPE_CHOICES = [
        ("sms", "SMS"),
        ("email", "Email"),
        ("calendar_invite", "Calendar Invite"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    recipient = models.CharField(max_length=200)
    subject = models.CharField(max_length=300, blank=True, default="")
    body = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    sent_at = models.DateTimeField(null=True, blank=True)
    booking_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type}] {self.recipient} — {self.status}"
