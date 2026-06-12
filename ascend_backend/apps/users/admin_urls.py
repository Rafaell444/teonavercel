from django.urls import path

from .admin_views import AddXPView, UserDetailView, UserListView

urlpatterns = [
    path("", UserListView.as_view(), name="admin-users-list"),
    path("<uuid:pk>/", UserDetailView.as_view(), name="admin-users-detail"),
    path("<uuid:pk>/add-xp/", AddXPView.as_view(), name="admin-users-add-xp"),
]
