from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminRole

from .models import Pillar, SiteSettings
from .serializers import PillarSerializer, SiteSettingsSerializer


class PillarListView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminRole()]

    def get(self, request):
        return Response(PillarSerializer(Pillar.objects.all(), many=True).data)

    def post(self, request):
        serializer = PillarSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PillarDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        try:
            pillar = Pillar.objects.get(pk=pk)
        except Pillar.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PillarSerializer(pillar, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            pillar = Pillar.objects.get(pk=pk)
        except Pillar.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        pillar.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SiteSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminRole()]

    def get(self, request):
        settings = SiteSettings.get()
        return Response(SiteSettingsSerializer(settings).data)

    def patch(self, request):
        settings = SiteSettings.get()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SiteSettingsSerializer(settings).data)
