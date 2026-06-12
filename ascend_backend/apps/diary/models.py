from django.db import models

from apps.users.models import User


class DiaryEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="diary_entries")
    date = models.DateField()
    title = models.CharField(max_length=200)
    excerpt = models.TextField()
    mood = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} — {self.title}"
