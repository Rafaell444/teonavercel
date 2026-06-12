from django.urls import path

from .views import MessageDetailView, MessageListView

urlpatterns = [
    path("", MessageListView.as_view(), name="messages-list"),
    path("<uuid:pk>/", MessageDetailView.as_view(), name="messages-detail"),
]
