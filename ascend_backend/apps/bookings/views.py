from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.sessions.models import SessionTimeSlot
from apps.users.permissions import IsAdminRole

from .models import Booking, BookingSession
from .serializers import (
    BookingSerializer,
    BookingSessionSerializer,
    ScheduleNextSessionSerializer,
)


class BookingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "admin":
            qs = Booking.objects.select_related("user", "session").all()
        else:
            qs = Booking.objects.select_related("user", "session").filter(user=request.user)
        return Response(BookingSerializer(qs, many=True).data)

    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save(user=request.user)

        if booking.date and booking.time:
            BookingSession.objects.create(
                booking=booking,
                session_number=1,
                date=booking.date if booking.date != "" else None,
                format=booking.format,
                meet_link=_generate_meet_link() if booking.format == "online" else "",
            )

        from apps.notifications.services import notify_booking_created
        notify_booking_created(booking)

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingStatusView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get("status")
        if new_status not in ["Confirmed", "Pending", "Cancelled", "Expired"]:
            return Response(
                {"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = new_status
        booking.save(update_fields=["status"])
        return Response(BookingSerializer(booking).data)


class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.select_related("user", "session").get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if booking.user != request.user and request.user.role != "admin":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        return Response(BookingSerializer(booking).data)


class ScheduleNextSessionView(APIView):
    """User schedules their next session within a multi-session booking."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.is_expired:
            return Response(
                {"detail": "This booking has expired."},
                status=status.HTTP_403_FORBIDDEN,
            )

        scheduled_count = booking.booking_sessions.count()
        if scheduled_count >= booking.num_sessions:
            return Response(
                {"detail": "All sessions have been scheduled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ScheduleNextSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        time_slot = None
        if data.get("time_slot_id"):
            try:
                time_slot = SessionTimeSlot.objects.get(
                    pk=data["time_slot_id"], is_blocked=False, is_booked=False
                )
            except SessionTimeSlot.DoesNotExist:
                return Response(
                    {"detail": "Time slot not available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            time_slot.is_booked = True
            time_slot.booked_by = request.user
            time_slot.save()

        meet_link = ""
        if data["format"] == "online":
            meet_link = _generate_meet_link()

        bs = BookingSession.objects.create(
            booking=booking,
            time_slot=time_slot,
            session_number=scheduled_count + 1,
            date=time_slot.date if time_slot else data.get("date"),
            time=time_slot.start_time if time_slot else data.get("time"),
            format=data["format"],
            meet_link=meet_link,
        )

        from apps.notifications.services import notify_session_scheduled
        notify_session_scheduled(bs)

        return Response(BookingSessionSerializer(bs).data, status=status.HTTP_201_CREATED)


class BookingSessionsListView(APIView):
    """List all sessions within a booking."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if booking.user != request.user and request.user.role != "admin":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        sessions = booking.booking_sessions.all()
        return Response(BookingSessionSerializer(sessions, many=True).data)


def _generate_meet_link():
    import uuid
    short = str(uuid.uuid4())[:12].replace("-", "")
    return f"https://meet.google.com/mock-{short[:3]}-{short[3:7]}-{short[7:]}"
