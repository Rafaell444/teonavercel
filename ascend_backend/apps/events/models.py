import uuid

from django.db import models


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=100)
    date = models.CharField(max_length=50)
    location = models.CharField(max_length=200)
    seats = models.CharField(max_length=100)
    image = models.ImageField(
        null=True,
        blank=True,
        upload_to="events/",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
