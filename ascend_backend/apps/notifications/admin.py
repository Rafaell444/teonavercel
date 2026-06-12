from django.contrib import admin

from .models import NotificationLog


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ["notification_type", "recipient", "status", "sent_at", "created_at"]
    list_filter = ["notification_type", "status"]
    search_fields = ["recipient", "body"]
    readonly_fields = ["id", "created_at"]
