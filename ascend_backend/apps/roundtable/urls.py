from django.urls import path

from .views import SeatClaimView, SeatListView

urlpatterns = [
    path("seats/", SeatListView.as_view(), name="roundtable-seats"),
    path("seats/<int:seat_number>/claim/", SeatClaimView.as_view(), name="roundtable-claim"),
]
