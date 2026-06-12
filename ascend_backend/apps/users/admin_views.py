from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .permissions import IsAdminRole
from .serializers import UserSerializer


class UserListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        qs = User.objects.filter(is_active=True)
        role = request.query_params.get("role")
        tier = request.query_params.get("tier")
        search = request.query_params.get("search")
        if role:
            qs = qs.filter(role=role)
        if tier:
            qs = qs.filter(tier=tier)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(email__icontains=search))
        return Response(UserSerializer(qs, many=True).data)


class UserDetailView(APIView):
    permission_classes = [IsAdminRole]

    def _get_user(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self._get_user(pk)
        if not user:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserSerializer(user).data)

    def patch(self, request, pk):
        user = self._get_user(pk)
        if not user:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        allowed = ["tier", "xp", "vouchers", "role"]
        data = {k: v for k, v in request.data.items() if k in allowed}
        serializer = UserSerializer(user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(user).data)

    def delete(self, request, pk):
        user = self._get_user(pk)
        if not user:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AddXPView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        amount = request.data.get("amount")
        try:
            amount = int(amount)
        except (TypeError, ValueError):
            return Response(
                {"detail": "amount must be an integer."}, status=status.HTTP_400_BAD_REQUEST
            )
        user.xp += amount
        user.recalculate_tier()
        user.save()
        return Response(UserSerializer(user).data)
