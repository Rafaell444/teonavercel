from django.db.models import Q
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminRole

from .models import VaultItem
from .serializers import VaultItemSerializer


class VaultListView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        if request.user.role == "admin":
            qs = VaultItem.objects.select_related("added_by", "assigned_to").all()
        else:
            qs = VaultItem.objects.select_related("added_by", "assigned_to").filter(
                Q(assigned_to=request.user) | Q(assigned_to__isnull=True)
            )
        return Response(VaultItemSerializer(qs, many=True).data)

    def post(self, request):
        if request.user.role != "admin":
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = VaultItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(added_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VaultDetailView(APIView):
    permission_classes = [IsAdminRole]

    def delete(self, request, pk):
        try:
            item = VaultItem.objects.get(pk=pk)
        except VaultItem.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
