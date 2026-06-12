from rest_framework import serializers

from .models import Voucher


class VoucherSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Voucher
        fields = [
            "id", "code", "discount_type", "discount_value",
            "max_uses", "times_used", "valid_from", "valid_until",
            "is_active", "applicable_sessions", "is_valid", "created_at",
        ]
        read_only_fields = ["id", "times_used", "created_at"]


class VoucherValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    session_id = serializers.UUIDField(required=False, allow_null=True)
    num_sessions = serializers.IntegerField(required=False, default=3)
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
