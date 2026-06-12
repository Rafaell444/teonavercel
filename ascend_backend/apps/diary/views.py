from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DiaryEntry
from .serializers import DiaryEntrySerializer


class DiaryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = DiaryEntry.objects.filter(user=request.user)
        return Response(DiaryEntrySerializer(entries, many=True).data)

    def post(self, request):
        serializer = DiaryEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
