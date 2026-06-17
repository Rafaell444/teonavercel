from rest_framework import serializers

from .models import Certificate, Pillar, SiteSettings


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ["id", "title", "image", "order"]
        read_only_fields = ["id"]


class PillarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pillar
        fields = [
            "id", "title", "title_ka", "blurb", "blurb_ka",
            "points", "points_ka", "order",
            "long_description", "long_description_ka",
            "history", "history_ka",
        ]
        read_only_fields = ["id"]


class SiteSettingsSerializer(serializers.ModelSerializer):
    """Converts snake_case model fields to camelCase for the frontend."""

    brandName = serializers.CharField(source="brand_name", required=False)
    heroBadge = serializers.CharField(source="hero_badge", required=False, allow_blank=True)
    heroBadgeKa = serializers.CharField(source="hero_badge_ka", required=False, allow_blank=True)
    heroTitle = serializers.CharField(source="hero_title", required=False, allow_blank=True)
    heroTitleKa = serializers.CharField(source="hero_title_ka", required=False, allow_blank=True)
    heroHighlight = serializers.CharField(source="hero_highlight", required=False, allow_blank=True)
    heroHighlightKa = serializers.CharField(source="hero_highlight_ka", required=False, allow_blank=True)
    heroSubtitle = serializers.CharField(source="hero_subtitle", required=False, allow_blank=True)
    heroSubtitleKa = serializers.CharField(source="hero_subtitle_ka", required=False, allow_blank=True)
    footerTagline = serializers.CharField(source="footer_tagline", required=False, allow_blank=True)
    footerTaglineKa = serializers.CharField(source="footer_tagline_ka", required=False, allow_blank=True)
    contactEmail = serializers.EmailField(source="contact_email", required=False, allow_blank=True)
    contactPhone = serializers.CharField(source="contact_phone", required=False, allow_blank=True)
    contactLocation = serializers.CharField(source="contact_location", required=False, allow_blank=True)
    statHours = serializers.CharField(source="stat_hours", required=False, allow_blank=True)
    statLives = serializers.CharField(source="stat_lives", required=False, allow_blank=True)
    statReturn = serializers.CharField(source="stat_return", required=False, allow_blank=True)
    heroImage = serializers.ImageField(source="hero_image", required=False, allow_null=True)

    class Meta:
        model = SiteSettings
        fields = [
            "brandName", "heroBadge", "heroBadgeKa", "heroTitle", "heroTitleKa",
            "heroHighlight", "heroHighlightKa", "heroSubtitle", "heroSubtitleKa",
            "footerTagline", "footerTaglineKa", "contactEmail", "contactPhone",
            "contactLocation", "statHours", "statLives", "statReturn",
            "heroImage",
        ]
