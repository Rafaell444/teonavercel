from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminRole

from .models import Voucher
from .serializers import VoucherSerializer, VoucherValidateSerializer


class VoucherListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        qs = Voucher.objects.all()
        return Response(VoucherSerializer(qs, many=True).data)

    def post(self, request):
        data = request.data.copy()
        if "code" in data:
            data["code"] = data["code"].upper().strip()
        serializer = VoucherSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VoucherDetailView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        try:
            voucher = Voucher.objects.get(pk=pk)
        except Voucher.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = VoucherSerializer(voucher, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            voucher = Voucher.objects.get(pk=pk)
        except Voucher.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        voucher.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VoucherValidateView(APIView):
    """Public endpoint: check if a voucher code is valid and return discount info."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VoucherValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        code = data["code"].upper().strip()
        try:
            voucher = Voucher.objects.get(code=code)
        except Voucher.DoesNotExist:
            return Response(
                {"detail": "Invalid voucher code."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not voucher.is_valid:
            return Response(
                {"detail": "This voucher has expired or reached its usage limit."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session_id = data.get("session_id")
        if session_id and voucher.applicable_sessions.exists():
            if not voucher.applicable_sessions.filter(pk=session_id).exists():
                return Response(
                    {"detail": "This voucher is not applicable to this session."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        base_price = data.get("base_price", 0)
        discount = voucher.compute_discount(base_price) if base_price else 0

        return Response({
            "code": voucher.code,
            "discount_type": voucher.discount_type,
            "discount_value": str(voucher.discount_value),
            "computed_discount": str(discount),
            "valid": True,
        })
