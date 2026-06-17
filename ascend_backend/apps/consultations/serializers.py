from rest_framework import serializers

from .models import ConsultationBooking, ConsultationSlot


class ConsultationSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationSlot
        fields = ["id", "date", "start_time", "end_time", "is_booked"]
        read_only_fields = ["id", "is_booked"]


class ConsultationSlotAdminSerializer(serializers.ModelSerializer):
    booked_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ConsultationSlot
        fields = ["id", "date", "start_time", "end_time", "is_booked", "booked_by", "booked_by_name"]
        read_only_fields = ["id", "is_booked", "booked_by"]

    def get_booked_by_name(self, obj):
        return obj.booked_by.name if obj.booked_by else None


class ConsultationBookingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    date = serializers.DateField(source="slot.date", read_only=True)
    start_time = serializers.TimeField(source="slot.start_time", read_only=True)
    end_time = serializers.TimeField(source="slot.end_time", read_only=True)

    class Meta:
        model = ConsultationBooking
        fields = [
            "id", "user_name", "user_email", "date", "start_time", "end_time",
            "meet_link", "status", "created_at",
        ]
