from rest_framework import serializers

from .models import Pillar, SiteSettings


class PillarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pillar
        fields = ["id", "title", "blurb", "points", "order"]
        read_only_fields = ["id"]


class SiteSettingsSerializer(serializers.ModelSerializer):
    """Converts snake_case model fields to camelCase for the frontend."""

    brandName = serializers.CharField(source="brand_name", required=False)
    heroBadge = serializers.CharField(source="hero_badge", required=False, allow_blank=True)
    heroTitle = serializers.CharField(source="hero_title", required=False, allow_blank=True)
    heroHighlight = serializers.CharField(source="hero_highlight", required=False, allow_blank=True)
    heroSubtitle = serializers.CharField(source="hero_subtitle", required=False, allow_blank=True)
    footerTagline = serializers.CharField(source="footer_tagline", required=False, allow_blank=True)
    contactEmail = serializers.EmailField(source="contact_email", required=False, allow_blank=True)
    contactPhone = serializers.CharField(source="contact_phone", required=False, allow_blank=True)
    contactLocation = serializers.CharField(source="contact_location", required=False, allow_blank=True)
    statHours = serializers.CharField(source="stat_hours", required=False, allow_blank=True)
    statLives = serializers.CharField(source="stat_lives", required=False, allow_blank=True)
    statReturn = serializers.CharField(source="stat_return", required=False, allow_blank=True)

    class Meta:
        model = SiteSettings
        fields = [
            "brandName", "heroBadge", "heroTitle", "heroHighlight",
            "heroSubtitle", "footerTagline", "contactEmail", "contactPhone",
            "contactLocation", "statHours", "statLives", "statReturn",
        ]
