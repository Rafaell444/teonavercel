from django.contrib import admin

from .models import Voucher


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ["code", "discount_type", "discount_value", "times_used", "max_uses", "is_active"]
    list_filter = ["discount_type", "is_active"]
    search_fields = ["code"]
    filter_horizontal = ["applicable_sessions"]
