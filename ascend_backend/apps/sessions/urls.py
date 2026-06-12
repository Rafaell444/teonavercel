from django.urls import path

from .views import (
    GroupScheduleDetailView,
    GroupScheduleListView,
    GroupSeatClaimView,
    GroupSeatListView,
    GroupSeatReleaseView,
    PackageDetailView,
    PackageListView,
    SessionDetailView,
    SessionListView,
    TimeSlotBulkCreateView,
    TimeSlotDetailView,
    TimeSlotListView,
)

urlpatterns = [
    # Sessions CRUD
    path("", SessionListView.as_view(), name="sessions-list"),
    path("<uuid:pk>/", SessionDetailView.as_view(), name="sessions-detail"),
    # Time slots for individual sessions
    path(
        "<uuid:session_pk>/slots/",
        TimeSlotListView.as_view(),
        name="session-slots-list",
    ),
    path(
        "<uuid:session_pk>/slots/bulk/",
        TimeSlotBulkCreateView.as_view(),
        name="session-slots-bulk",
    ),
    path(
        "<uuid:session_pk>/slots/<uuid:pk>/",
        TimeSlotDetailView.as_view(),
        name="session-slots-detail",
    ),
    # Group session schedules
    path(
        "<uuid:session_pk>/schedules/",
        GroupScheduleListView.as_view(),
        name="group-schedules-list",
    ),
    path(
        "<uuid:session_pk>/schedules/<uuid:pk>/",
        GroupScheduleDetailView.as_view(),
        name="group-schedules-detail",
    ),
    # Group session seats
    path(
        "schedules/<uuid:schedule_pk>/seats/",
        GroupSeatListView.as_view(),
        name="group-seats-list",
    ),
    path(
        "schedules/<uuid:schedule_pk>/seats/<int:seat_number>/claim/",
        GroupSeatClaimView.as_view(),
        name="group-seat-claim",
    ),
    path(
        "schedules/<uuid:schedule_pk>/seats/<int:seat_number>/release/",
        GroupSeatReleaseView.as_view(),
        name="group-seat-release",
    ),
    # Packages
    path("packages/", PackageListView.as_view(), name="packages-list"),
    path("packages/<uuid:pk>/", PackageDetailView.as_view(), name="packages-detail"),
]
