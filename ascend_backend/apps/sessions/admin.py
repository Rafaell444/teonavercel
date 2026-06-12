from django.contrib import admin

from .models import (
    GroupSessionSchedule,
    GroupSessionSeat,
    Package,
    Session,
    SessionTimeSlot,
)


class SessionTimeSlotInline(admin.TabularInline):
    model = SessionTimeSlot
    extra = 0


class GroupSessionScheduleInline(admin.TabularInline):
    model = GroupSessionSchedule
    extra = 0


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ["title", "session_type", "format", "price", "is_active"]
    list_filter = ["session_type", "format", "is_active"]
    search_fields = ["title"]
    inlines = [SessionTimeSlotInline, GroupSessionScheduleInline]


@admin.register(SessionTimeSlot)
class SessionTimeSlotAdmin(admin.ModelAdmin):
    list_display = ["session", "date", "start_time", "is_blocked", "is_booked"]
    list_filter = ["is_blocked", "is_booked", "date"]


@admin.register(GroupSessionSchedule)
class GroupSessionScheduleAdmin(admin.ModelAdmin):
    list_display = ["session", "date", "start_time", "format"]


@admin.register(GroupSessionSeat)
class GroupSessionSeatAdmin(admin.ModelAdmin):
    list_display = ["schedule", "seat_number", "user", "reserved_at"]


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ["title", "price", "duration_months", "is_active"]
    filter_horizontal = ["sessions"]
