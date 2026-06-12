from django.urls import path

from .views import SubmitTestView, TestDetailView, TestListView, TestResultsView

urlpatterns = [
    path("", TestListView.as_view(), name="tests-list"),
    path("<uuid:pk>/", TestDetailView.as_view(), name="tests-detail"),
    path("<uuid:pk>/submit/", SubmitTestView.as_view(), name="tests-submit"),
    path("<uuid:pk>/results/", TestResultsView.as_view(), name="tests-results"),
]
