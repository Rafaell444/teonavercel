from django.contrib import admin

from .models import Booking, BookingSession


class BookingSessionInline(admin.TabularInline):
    model = BookingSession
    extra = 0
    readonly_fields = ["meet_link"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["user", "session", "num_sessions", "sessions_used", "format", "session_language", "total", "status", "expires_at"]
    list_filter = ["status", "format", "session_language", "is_package"]
    search_fields = ["user__email", "session__title"]
    inlines = [BookingSessionInline]


@admin.register(BookingSession)
class BookingSessionAdmin(admin.ModelAdmin):
    list_display = ["booking", "session_number", "date", "time", "format", "status"]
    list_filter = ["status", "format"]
