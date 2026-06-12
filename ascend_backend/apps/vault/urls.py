from django.urls import path

from .views import VaultDetailView, VaultListView

urlpatterns = [
    path("", VaultListView.as_view(), name="vault-list"),
    path("<uuid:pk>/", VaultDetailView.as_view(), name="vault-detail"),
]
