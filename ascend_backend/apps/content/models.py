import uuid

from django.db import models


class Pillar(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150)
    title_ka = models.CharField(max_length=150, blank=True, default="")
    blurb = models.TextField()
    blurb_ka = models.TextField(blank=True, default="")
    points = models.JSONField()
    points_ka = models.JSONField(blank=True, default=list)
    order = models.PositiveSmallIntegerField(default=0)
    long_description = models.TextField(blank=True, default="")
    long_description_ka = models.TextField(blank=True, default="")
    history = models.TextField(blank=True, default="")
    history_ka = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class Certificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to="certificates/")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class SiteSettings(models.Model):
    brand_name = models.CharField(max_length=60, default="Ascend")
    hero_badge = models.CharField(max_length=200, blank=True)
    hero_badge_ka = models.CharField(max_length=200, blank=True)
    hero_title = models.CharField(max_length=200, blank=True)
    hero_title_ka = models.CharField(max_length=200, blank=True)
    hero_highlight = models.CharField(max_length=100, blank=True)
    hero_highlight_ka = models.CharField(max_length=100, blank=True)
    hero_subtitle = models.TextField(blank=True)
    hero_subtitle_ka = models.TextField(blank=True)
    footer_tagline = models.TextField(blank=True)
    footer_tagline_ka = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    contact_location = models.CharField(max_length=200, blank=True)
    stat_hours = models.CharField(max_length=20, blank=True)
    stat_lives = models.CharField(max_length=20, blank=True)
    stat_return = models.CharField(max_length=20, blank=True)
    hero_image = models.ImageField(upload_to="hero/", blank=True)

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
