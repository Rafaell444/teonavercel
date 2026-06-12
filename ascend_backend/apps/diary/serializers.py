from rest_framework import serializers

from .models import DiaryEntry


class DiaryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DiaryEntry
        fields = ["id", "user", "date", "title", "excerpt", "mood", "created_at"]
        read_only_fields = ["id", "user", "created_at"]
