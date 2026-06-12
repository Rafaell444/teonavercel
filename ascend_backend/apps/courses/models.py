import uuid

from django.db import models


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
