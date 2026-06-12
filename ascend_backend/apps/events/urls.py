from django.urls import path

from .views import EventDetailView, EventListView

urlpatterns = [
    path("", EventListView.as_view(), name="events-list"),
    path("<uuid:pk>/", EventDetailView.as_view(), name="events-detail"),
]
