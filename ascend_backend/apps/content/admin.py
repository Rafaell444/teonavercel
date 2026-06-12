from django.contrib import admin

from .models import Pillar, SiteSettings


@admin.register(Pillar)
class PillarAdmin(admin.ModelAdmin):
    list_display = ["title", "order"]
    ordering = ["order"]


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Branding", {"fields": ("brand_name",)}),
        ("Hero Section", {"fields": ("hero_badge", "hero_title", "hero_highlight", "hero_subtitle")}),
        ("Footer", {"fields": ("footer_tagline",)}),
        ("Contact", {"fields": ("contact_email", "contact_phone", "contact_location")}),
        ("Stats", {"fields": ("stat_hours", "stat_lives", "stat_return")}),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()
