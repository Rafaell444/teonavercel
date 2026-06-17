import uuid

from django.db import models

from apps.users.models import User


class Session(models.Model):
    SESSION_TYPE_CHOICES = [
        ("group", "Group"),
        ("individual", "Individual"),
    ]
    FORMAT_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
        ("hybrid", "Hybrid"),
    ]

    LANGUAGE_CHOICES = [
        ("both", "Both"),
        ("ka", "Georgian"),
        ("en", "English"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    title_ka = models.CharField(max_length=200, blank=True, default="")
    description = models.TextField(blank=True, default="")
    description_ka = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default="online")
    language = models.CharField(max_length=4, choices=LANGUAGE_CHOICES, default="both")
    location = models.CharField(max_length=300, blank=True, default="")
    location_maps_url = models.URLField(blank=True, default="")
    max_seats = models.PositiveIntegerField(default=12, help_text="For group sessions")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_session_type_display()})"


class SessionTimeSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        Session, on_delete=models.CASCADE, related_name="time_slots"
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_blocked = models.BooleanField(default=False)
    is_booked = models.BooleanField(default=False)
    booked_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="booked_slots"
    )

    class Meta:
        ordering = ["date", "start_time"]
        unique_together = ["session", "date", "start_time"]

    def __str__(self):
        status = "Blocked" if self.is_blocked else ("Booked" if self.is_booked else "Available")
        return f"{self.session.title} — {self.date} {self.start_time} [{status}]"


class GroupSessionSchedule(models.Model):
    FORMAT_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        Session, on_delete=models.CASCADE, related_name="schedules"
    )
    date = models.DateField()
    start_time = models.TimeField()
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default="offline")
    location = models.CharField(max_length=300, blank=True, default="")
    location_maps_url = models.URLField(blank=True, default="")

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.session.title} — {self.date} {self.start_time}"


class GroupSessionSeat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule = models.ForeignKey(
        GroupSessionSchedule, on_delete=models.CASCADE, related_name="seats"
    )
    seat_number = models.PositiveIntegerField()
    user = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="group_seats"
    )
    reserved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["seat_number"]
        unique_together = ["schedule", "seat_number"]

    def __str__(self):
        occupant = self.user.name if self.user else "Empty"
        return f"Seat {self.seat_number} — {occupant}"


class Package(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    title_ka = models.CharField(max_length=200, blank=True, default="")
    description = models.TextField(blank=True, default="")
    description_ka = models.TextField(blank=True, default="")
    sessions = models.ManyToManyField(Session, related_name="packages", blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_months = models.PositiveIntegerField(
        default=6, help_text="Package duration in months (6-9)"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
