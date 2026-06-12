from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import RoundTableSeat
from .serializers import RoundTableSeatSerializer


class SeatListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        seats = RoundTableSeat.objects.select_related("user").all()
        return Response(RoundTableSeatSerializer(seats, many=True).data)


class SeatClaimView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, seat_number):
        try:
            seat = RoundTableSeat.objects.select_for_update().get(seat_number=seat_number)
        except RoundTableSeat.DoesNotExist:
            return Response({"detail": "Seat not found."}, status=status.HTTP_404_NOT_FOUND)

        if seat.user is not None:
            return Response({"detail": "Seat already taken."}, status=status.HTTP_409_CONFLICT)

        if hasattr(request.user, "roundtable_seat"):
            return Response(
                {"detail": "You already have a seat."},
                status=status.HTTP_409_CONFLICT,
            )

        seat.user = request.user
        seat.reserved_at = timezone.now()
        seat.save()
        return Response(RoundTableSeatSerializer(seat).data)

    def delete(self, request, seat_number):
        try:
            seat = RoundTableSeat.objects.get(seat_number=seat_number)
        except RoundTableSeat.DoesNotExist:
            return Response({"detail": "Seat not found."}, status=status.HTTP_404_NOT_FOUND)

        if seat.user != request.user:
            return Response(
                {"detail": "You do not own this seat."}, status=status.HTTP_403_FORBIDDEN
            )

        seat.user = None
        seat.reserved_at = None
        seat.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
