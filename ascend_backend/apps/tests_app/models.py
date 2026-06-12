import uuid

from django.db import models

from apps.users.models import User


class Test(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    published = models.BooleanField(default=False)
    # Maps course name → "why" recommendation text shown after the test
    course_outcomes = models.JSONField(default=dict, blank=True)
    # Maps answer combination key → course name
    # Key format: "ansIdx_q1,ansIdx_q2,..." e.g. "0,2" means Q1:option0, Q2:option2
    combination_results = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class TestQuestion(models.Model):
    test = models.ForeignKey(Test, related_name="questions", on_delete=models.CASCADE)
    order = models.PositiveSmallIntegerField()
    question = models.TextField()
    options = models.JSONField()
    correct = models.PositiveSmallIntegerField(null=True, blank=True)
    # Parallel list to `options`: which course each option points to
    option_courses = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.test.title} — Q{self.order}"


class TestResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="test_results")
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="results")
    answers = models.JSONField()
    score = models.FloatField(default=0.0)
    recommended_course = models.CharField(max_length=200, blank=True, default="")
    recommendation_why = models.TextField(blank=True, default="")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.user.email} — {self.test.title} ({self.score:.0%})"
