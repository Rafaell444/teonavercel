from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "type", "date", "location", "seats"]
    search_fields = ["title", "type"]
