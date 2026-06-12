from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "subject", "read", "created_at"]
    list_filter = ["read"]
    search_fields = ["name", "email", "subject"]
