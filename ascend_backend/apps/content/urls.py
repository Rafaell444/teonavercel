from django.urls import path

from .views import PillarDetailView, PillarListView, SiteSettingsView

urlpatterns = [
    path("pillars/", PillarListView.as_view(), name="pillars-list"),
    path("pillars/<uuid:pk>/", PillarDetailView.as_view(), name="pillars-detail"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
]
