from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "title", "type", "date", "location", "seats", "image", "created_at"]
        read_only_fields = ["id", "created_at"]
