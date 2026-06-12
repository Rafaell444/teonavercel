from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminRole

from .models import ContactMessage
from .serializers import ContactMessageSerializer
from .tasks import notify_admin_new_message


class MessageListView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAdminRole()]

    def get(self, request):
        qs = ContactMessage.objects.all()
        read_filter = request.query_params.get("read")
        if read_filter is not None:
            qs = qs.filter(read=read_filter.lower() in ("true", "1"))
        return Response(ContactMessageSerializer(qs, many=True).data)

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        msg = serializer.save()
        notify_admin_new_message.delay(str(msg.id))
        return Response(ContactMessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class MessageDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        try:
            msg = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        msg.read = True
        msg.save()
        return Response(ContactMessageSerializer(msg).data)

    def delete(self, request, pk):
        try:
            msg = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        msg.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
