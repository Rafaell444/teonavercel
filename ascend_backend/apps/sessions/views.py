from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminRole

from .models import (
    GroupSessionSchedule,
    GroupSessionSeat,
    Package,
    Session,
    SessionTimeSlot,
)
from .serializers import (
    GroupSessionScheduleSerializer,
    GroupSessionSeatSerializer,
    PackageSerializer,
    SessionSerializer,
    SessionTimeSlotSerializer,
)


# ─── Sessions CRUD ───────────────────────────────────────────────────────────


class SessionListView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminRole()]

    def get(self, request):
        qs = Session.objects.filter(is_active=True)
        session_type = request.query_params.get("type")
        if session_type in ("group", "individual"):
            qs = qs.filter(session_type=session_type)
        return Response(SessionSerializer(qs, many=True).data)

    def post(self, request):
        serializer = SessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SessionDetailView(APIView):
    permission_classes = [IsAdminRole]

    def get_object(self, pk):
        try:
            return Session.objects.get(pk=pk)
        except Session.DoesNotExist:
            return None

    def get(self, request, pk):
        session = self.get_object(pk)
        if not session:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(SessionSerializer(session).data)

    def patch(self, request, pk):
        session = self.get_object(pk)
        if not session:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = SessionSerializer(session, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        session = self.get_object(pk)
        if not session:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Time Slots (Individual Sessions) ────────────────────────────────────────


class TimeSlotListView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminRole()]

    def get(self, request, session_pk):
        qs = SessionTimeSlot.objects.filter(session_id=session_pk)
        show_all = request.query_params.get("all") == "true"
        if not show_all:
            qs = qs.filter(is_blocked=False, is_booked=False, date__gte=timezone.now().date())
        return Response(SessionTimeSlotSerializer(qs, many=True).data)

    def post(self, request, session_pk):
        data = request.data.copy()
        data["session"] = session_pk
        serializer = SessionTimeSlotSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TimeSlotDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, session_pk, pk):
        try:
            slot = SessionTimeSlot.objects.get(pk=pk, session_id=session_pk)
        except SessionTimeSlot.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = SessionTimeSlotSerializer(slot, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, session_pk, pk):
        try:
            slot = SessionTimeSlot.objects.get(pk=pk, session_id=session_pk)
        except SessionTimeSlot.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        slot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TimeSlotBulkCreateView(APIView):
    """Create multiple time slots at once for admin convenience."""
    permission_classes = [IsAdminRole]

    def post(self, request, session_pk):
        slots_data = request.data.get("slots", [])
        created = []
        for slot_data in slots_data:
            slot_data["session"] = session_pk
            serializer = SessionTimeSlotSerializer(data=slot_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            created.append(serializer.data)
        return Response(created, status=status.HTTP_201_CREATED)


# ─── Group Session Schedules ─────────────────────────────────────────────────


class GroupScheduleListView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminRole()]

    def get(self, request, session_pk):
        qs = GroupSessionSchedule.objects.filter(session_id=session_pk)
        return Response(GroupSessionScheduleSerializer(qs, many=True).data)

    def post(self, request, session_pk):
        data = request.data.copy()
        data["session"] = session_pk
        serializer = GroupSessionScheduleSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        schedule = serializer.save()
        session = Session.objects.get(pk=session_pk)
        for i in range(1, session.max_seats + 1):
            GroupSessionSeat.objects.create(schedule=schedule, seat_number=i)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GroupScheduleDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, session_pk, pk):
        try:
            schedule = GroupSessionSchedule.objects.get(pk=pk, session_id=session_pk)
        except GroupSessionSchedule.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = GroupSessionScheduleSerializer(schedule, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, session_pk, pk):
        try:
            schedule = GroupSessionSchedule.objects.get(pk=pk, session_id=session_pk)
        except GroupSessionSchedule.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Group Session Seats ─────────────────────────────────────────────────────


class GroupSeatListView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, schedule_pk):
        seats = GroupSessionSeat.objects.filter(schedule_id=schedule_pk)
        return Response(GroupSessionSeatSerializer(seats, many=True).data)


def _schedule_datetime_strings(schedule):
    date_str = schedule.date.strftime("%b %d, %Y")
    time_str = schedule.start_time.strftime("%H:%M")
    return date_str, time_str


class GroupSeatClaimView(APIView):
    """Reserve a seat and create a confirmed booking (mock payment)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, schedule_pk, seat_number):
        from apps.bookings.models import Booking, BookingSession
        from apps.bookings.serializers import BookingSerializer
        from apps.notifications.services import generate_meet_link, notify_booking_created

        try:
            seat = GroupSessionSeat.objects.select_related(
                "schedule", "schedule__session"
            ).get(schedule_id=schedule_pk, seat_number=seat_number)
        except GroupSessionSeat.DoesNotExist:
            return Response({"detail": "Seat not found."}, status=status.HTTP_404_NOT_FOUND)

        if seat.user is not None:
            return Response({"detail": "Seat already taken."}, status=status.HTTP_409_CONFLICT)

        already_has = GroupSessionSeat.objects.filter(
            schedule_id=schedule_pk, user=request.user
        ).exists()
        if already_has:
            return Response(
                {"detail": "You already have a seat for this session."},
                status=status.HTTP_409_CONFLICT,
            )

        schedule = seat.schedule
        session = schedule.session
        date_str, time_str = _schedule_datetime_strings(schedule)
        meet_link = generate_meet_link() if schedule.format == "online" else ""

        with transaction.atomic():
            booking = Booking.objects.create(
                user=request.user,
                session=session,
                num_sessions=1,
                date=date_str,
                time=time_str,
                format=schedule.format,
                total=session.price,
                meet_link=meet_link,
                status="Confirmed",
            )
            BookingSession.objects.create(
                booking=booking,
                session_number=1,
                date=schedule.date,
                time=schedule.start_time,
                format=schedule.format,
                meet_link=meet_link,
                status="scheduled",
            )
            seat.user = request.user
            seat.reserved_at = timezone.now()
            seat.save()

        notify_booking_created(booking)

        return Response(
            {
                "seat": GroupSessionSeatSerializer(seat).data,
                "booking": BookingSerializer(booking).data,
            },
            status=status.HTTP_201_CREATED,
        )


class GroupSeatReleaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, schedule_pk, seat_number):
        from apps.bookings.models import Booking, BookingSession

        try:
            seat = GroupSessionSeat.objects.select_related("schedule").get(
                schedule_id=schedule_pk, seat_number=seat_number
            )
        except GroupSessionSeat.DoesNotExist:
            return Response({"detail": "Seat not found."}, status=status.HTTP_404_NOT_FOUND)

        if seat.user != request.user:
            return Response({"detail": "Not your seat."}, status=status.HTTP_403_FORBIDDEN)

        schedule = seat.schedule
        date_str, time_str = _schedule_datetime_strings(schedule)

        with transaction.atomic():
            Booking.objects.filter(
                user=request.user,
                session=schedule.session,
                date=date_str,
                time=time_str,
                status__in=["Confirmed", "Pending"],
            ).update(status="Cancelled")
            BookingSession.objects.filter(
                booking__user=request.user,
                booking__session=schedule.session,
                date=schedule.date,
                time=schedule.start_time,
            ).update(status="cancelled")
            seat.user = None
            seat.reserved_at = None
            seat.save()

        return Response(GroupSessionSeatSerializer(seat).data)


# ─── Packages ────────────────────────────────────────────────────────────────


class PackageListView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminRole()]

    def get(self, request):
        qs = Package.objects.filter(is_active=True)
        return Response(PackageSerializer(qs, many=True).data)

    def post(self, request):
        serializer = PackageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PackageDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        try:
            package = Package.objects.get(pk=pk)
        except Package.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PackageSerializer(package, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            package = Package.objects.get(pk=pk)
        except Package.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        package.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
