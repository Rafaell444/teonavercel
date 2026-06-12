import uuid

from django.db import models

from apps.users.models import User


class VaultItem(models.Model):
    CATEGORY_CHOICES = [
        ("Test", "Test"),
        ("Book", "Book"),
        ("Resource", "Resource"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    kind = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    locked = models.BooleanField(default=False)
    file = models.FileField(
        null=True,
        blank=True,
        upload_to="vault/",
    )
    added_by = models.ForeignKey(
        User, null=True, on_delete=models.SET_NULL, related_name="added_vault_items"
    )
    assigned_to = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="private_vault"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
