from django.conf import settings
from rest_framework import serializers

from .models import VaultItem


class VaultItemSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    added_by_name = serializers.CharField(source="added_by.name", read_only=True, default=None)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        source="assigned_to", read_only=True, allow_null=True
    )
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = VaultItem
        fields = [
            "id", "title", "kind", "category", "locked",
            "file", "file_url", "added_by_name", "assigned_to",
            "assigned_to_id", "assigned_to_name", "created_at",
        ]
        read_only_fields = ["id", "created_at", "file_url", "added_by_name", "assigned_to_name"]
        extra_kwargs = {
            "file": {"write_only": True, "required": False},
            "assigned_to": {"write_only": True, "required": False, "allow_null": True},
        }

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.name or obj.assigned_to.email
        return None

    def get_file_url(self, obj):
        if not obj.file:
            return None
        if settings.DEBUG:
            return f"{settings.MEDIA_URL}{obj.file.name}"
        try:
            import boto3
            s3 = boto3.client(
                "s3",
                region_name=settings.AWS_S3_REGION_NAME,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
            return s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": obj.file.name},
                ExpiresIn=3600,
            )
        except Exception:
            return None
