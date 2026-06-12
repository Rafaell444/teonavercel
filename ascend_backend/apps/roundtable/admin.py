from django.contrib import admin

from .models import RoundTableSeat


@admin.register(RoundTableSeat)
class RoundTableSeatAdmin(admin.ModelAdmin):
    list_display = ["seat_number", "user", "reserved_at"]
