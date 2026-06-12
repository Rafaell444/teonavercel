import uuid

from django.db import models


class Testimonial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote = models.TextField()
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=150)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} — {self.role}"
