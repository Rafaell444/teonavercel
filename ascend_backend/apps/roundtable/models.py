from django.db import models

from apps.users.models import User


class RoundTableSeat(models.Model):
    seat_number = models.PositiveSmallIntegerField(unique=True)
    user = models.OneToOneField(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="roundtable_seat"
    )
    reserved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["seat_number"]

    def __str__(self):
        occupant = self.user.name if self.user else "Empty"
        return f"Seat {self.seat_number} — {occupant}"
