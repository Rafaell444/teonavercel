from django.urls import path

from .views import CourseDetailView, CourseListView

urlpatterns = [
    path("", CourseListView.as_view(), name="courses-list"),
    path("<uuid:pk>/", CourseDetailView.as_view(), name="courses-detail"),
]
