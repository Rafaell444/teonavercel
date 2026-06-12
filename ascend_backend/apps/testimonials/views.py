from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminRole

from .models import Testimonial
from .serializers import TestimonialSerializer


class TestimonialListView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminRole()]

    def get(self, request):
        return Response(TestimonialSerializer(Testimonial.objects.all(), many=True).data)

    def post(self, request):
        serializer = TestimonialSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TestimonialDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        try:
            t = Testimonial.objects.get(pk=pk)
        except Testimonial.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TestimonialSerializer(t, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            t = Testimonial.objects.get(pk=pk)
        except Testimonial.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        t.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
