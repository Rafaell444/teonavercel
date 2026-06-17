from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.services import generate_meet_link
from apps.users.permissions import IsAdminRole

from .models import ConsultationBooking, ConsultationSlot
from .serializers import (
    ConsultationBookingSerializer,
    ConsultationSlotAdminSerializer,
    ConsultationSlotSerializer,
)


class ConsultationSlotListView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminRole()]

    def get(self, request):
        slots = ConsultationSlot.objects.filter(is_booked=False)
        if request.user.is_authenticated and getattr(request.user, "role", "") == "admin":
            slots = ConsultationSlot.objects.all()
            return Response(ConsultationSlotAdminSerializer(slots, many=True).data)
        return Response(ConsultationSlotSerializer(slots, many=True).data)

    def post(self, request):
        serializer = ConsultationSlotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConsultationSlotDetailView(APIView):
    permission_classes = [IsAdminRole]

    def delete(self, request, pk):
        try:
            slot = ConsultationSlot.objects.get(pk=pk)
        except ConsultationSlot.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        slot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ConsultationBookView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        slot_id = request.data.get("slot_id")
        if not slot_id:
            return Response({"detail": "slot_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            slot = ConsultationSlot.objects.select_for_update().get(pk=slot_id, is_booked=False)
        except ConsultationSlot.DoesNotExist:
            return Response(
                {"detail": "Slot is not available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slot.is_booked = True
        slot.booked_by = request.user
        slot.save()

        meet_link = generate_meet_link()
        booking = ConsultationBooking.objects.create(
            user=request.user,
            slot=slot,
            meet_link=meet_link,
        )

        return Response(
            ConsultationBookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class ConsultationBookingListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        bookings = ConsultationBooking.objects.select_related("user", "slot").all()
        return Response(ConsultationBookingSerializer(bookings, many=True).data)
