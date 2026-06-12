from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allows access only to users with role == 'admin'."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level: admin always passes; members only their own objects."""

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == "admin":
            return True
        owner = getattr(obj, "user", None) or getattr(obj, "assigned_to", None)
        return owner == request.user
