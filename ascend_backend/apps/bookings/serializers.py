from rest_framework import serializers

from apps.sessions.models import Session

from .models import Booking, BookingSession


class BookingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingSession
        fields = [
            "id", "booking", "time_slot", "session_number",
            "date", "time", "format", "meet_link", "status", "created_at",
        ]
        read_only_fields = ["id", "booking", "created_at"]


class BookingSerializer(serializers.ModelSerializer):
    session_title = serializers.CharField(source="session.title", read_only=True)
    session_type = serializers.CharField(source="session.session_type", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(), source="session", write_only=True
    )
    is_expired = serializers.BooleanField(read_only=True)
    booking_sessions = BookingSessionSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "user", "user_name", "user_email",
            "session", "session_id", "session_title", "session_type",
            "num_sessions", "sessions_used",
            "date", "time", "format",
            "is_package", "package_duration_months",
            "total", "discount_amount", "voucher_code",
            "meet_link", "status", "is_expired",
            "purchased_at", "expires_at", "created_at",
            "booking_sessions",
        ]
        read_only_fields = [
            "id", "user", "total", "created_at", "purchased_at",
            "expires_at", "session", "user_name", "user_email",
            "session_title", "session_type", "is_expired",
        ]

    def create(self, validated_data):
        return Booking.objects.create(**validated_data)


class ScheduleNextSessionSerializer(serializers.Serializer):
    """Used when a user schedules their next session within a booking."""
    time_slot_id = serializers.UUIDField(required=False, allow_null=True)
    date = serializers.DateField(required=False)
    time = serializers.TimeField(required=False)
    format = serializers.ChoiceField(choices=["online", "offline"])
