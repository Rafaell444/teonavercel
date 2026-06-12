from django.urls import path

from .views import (
    BookingDetailView,
    BookingListView,
    BookingSessionsListView,
    BookingStatusView,
    ScheduleNextSessionView,
)

urlpatterns = [
    path("", BookingListView.as_view(), name="bookings-list"),
    path("<uuid:pk>/", BookingDetailView.as_view(), name="bookings-detail"),
    path("<uuid:pk>/status/", BookingStatusView.as_view(), name="bookings-status"),
    path(
        "<uuid:pk>/schedule-next/",
        ScheduleNextSessionView.as_view(),
        name="bookings-schedule-next",
    ),
    path(
        "<uuid:pk>/sessions/",
        BookingSessionsListView.as_view(),
        name="bookings-sessions-list",
    ),
]
