import uuid

from django.db import models


class Pillar(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150)
    blurb = models.TextField()
    points = models.JSONField()
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class SiteSettings(models.Model):
    brand_name = models.CharField(max_length=60, default="Ascend")
    hero_badge = models.CharField(max_length=200, blank=True)
    hero_title = models.CharField(max_length=200, blank=True)
    hero_highlight = models.CharField(max_length=100, blank=True)
    hero_subtitle = models.TextField(blank=True)
    footer_tagline = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    contact_location = models.CharField(max_length=200, blank=True)
    stat_hours = models.CharField(max_length=20, blank=True)
    stat_lives = models.CharField(max_length=20, blank=True)
    stat_return = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name_plural = "Site settings"

    def __str__(self):
        return self.brand_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
