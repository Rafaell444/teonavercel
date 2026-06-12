from django.contrib import admin

from .models import DiaryEntry


@admin.register(DiaryEntry)
class DiaryEntryAdmin(admin.ModelAdmin):
    list_display = ["user", "title", "date", "mood"]
    list_filter = ["mood"]
    search_fields = ["user__email", "title"]
