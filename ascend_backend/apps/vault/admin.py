from django.contrib import admin

from .models import VaultItem


@admin.register(VaultItem)
class VaultItemAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "kind", "locked", "assigned_to", "created_at"]
    list_filter = ["category", "locked"]
    search_fields = ["title"]
