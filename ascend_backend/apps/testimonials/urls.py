from django.urls import path

from .views import TestimonialDetailView, TestimonialListView

urlpatterns = [
    path("", TestimonialListView.as_view(), name="testimonials-list"),
    path("<uuid:pk>/", TestimonialDetailView.as_view(), name="testimonials-detail"),
]
