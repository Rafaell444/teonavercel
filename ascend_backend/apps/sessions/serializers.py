from rest_framework import serializers

from .models import (
    GroupSessionSchedule,
    GroupSessionSeat,
    Package,
    Session,
    SessionTimeSlot,
)


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = [
            "id", "title", "description", "price", "session_type",
            "format", "location", "location_maps_url", "max_seats",
            "is_active", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class SessionTimeSlotSerializer(serializers.ModelSerializer):
    booked_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SessionTimeSlot
        fields = [
            "id", "session", "date", "start_time", "end_time",
            "is_blocked", "is_booked", "booked_by", "booked_by_name",
        ]
        read_only_fields = ["id", "is_booked", "booked_by"]

    def get_booked_by_name(self, obj):
        if obj.booked_by:
            return obj.booked_by.name or obj.booked_by.email
        return None


class GroupSessionScheduleSerializer(serializers.ModelSerializer):
    seats_total = serializers.SerializerMethodField()
    seats_taken = serializers.SerializerMethodField()

    class Meta:
        model = GroupSessionSchedule
        fields = [
            "id", "session", "date", "start_time", "format",
            "location", "location_maps_url", "seats_total", "seats_taken",
        ]
        read_only_fields = ["id"]

    def get_seats_total(self, obj):
        return obj.seats.count()

    def get_seats_taken(self, obj):
        return obj.seats.filter(user__isnull=False).count()


class GroupSessionSeatSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_initials = serializers.SerializerMethodField()

    class Meta:
        model = GroupSessionSeat
        fields = [
            "id", "schedule", "seat_number", "user",
            "user_name", "user_initials", "reserved_at",
        ]
        read_only_fields = ["id", "reserved_at"]

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.name or obj.user.email
        return None

    def get_user_initials(self, obj):
        if obj.user:
            name = obj.user.name or obj.user.email
            parts = name.split()
            if len(parts) >= 2:
                return (parts[0][0] + parts[1][0]).upper()
            return name[0:2].upper()
        return None


class PackageSerializer(serializers.ModelSerializer):
    session_ids = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(), many=True, source="sessions", required=False
    )
    sessions_detail = SessionSerializer(source="sessions", many=True, read_only=True)

    class Meta:
        model = Package
        fields = [
            "id", "title", "description", "price", "duration_months",
            "is_active", "created_at", "session_ids", "sessions_detail",
        ]
        read_only_fields = ["id", "created_at"]
