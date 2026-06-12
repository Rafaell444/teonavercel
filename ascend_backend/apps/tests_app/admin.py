from django.contrib import admin

from .models import Test, TestQuestion, TestResult


class TestQuestionInline(admin.TabularInline):
    model = TestQuestion
    extra = 1


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "published", "created_at"]
    list_filter = ["published", "category"]
    inlines = [TestQuestionInline]


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ["user", "test", "score", "completed_at"]
    list_filter = ["test"]
