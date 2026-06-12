from rest_framework import serializers

from .models import RoundTableSeat


class RoundTableSeatSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True, allow_null=True)
    user_initials = serializers.SerializerMethodField()

    class Meta:
        model = RoundTableSeat
        fields = ["seat_number", "user", "user_name", "user_initials", "reserved_at"]
        read_only_fields = ["seat_number", "user", "user_name", "user_initials", "reserved_at"]

    def get_user_initials(self, obj):
        if obj.user:
            return obj.user.initials
        return None
