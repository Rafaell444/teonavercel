from django.urls import path

from .views import VoucherDetailView, VoucherListView, VoucherValidateView

urlpatterns = [
    path("", VoucherListView.as_view(), name="vouchers-list"),
    path("<uuid:pk>/", VoucherDetailView.as_view(), name="vouchers-detail"),
    path("validate/", VoucherValidateView.as_view(), name="vouchers-validate"),
]
