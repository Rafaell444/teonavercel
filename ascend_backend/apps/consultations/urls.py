from django.urls import path

from .views import (
    ConsultationBookingListView,
    ConsultationBookView,
    ConsultationSlotDetailView,
    ConsultationSlotListView,
)

urlpatterns = [
    path("slots/", ConsultationSlotListView.as_view(), name="consultation-slots"),
    path("slots/<uuid:pk>/", ConsultationSlotDetailView.as_view(), name="consultation-slot-detail"),
    path("book/", ConsultationBookView.as_view(), name="consultation-book"),
    path("", ConsultationBookingListView.as_view(), name="consultation-bookings"),
]
