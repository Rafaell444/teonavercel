from rest_framework import serializers

from .models import Test, TestQuestion, TestResult


class TestQuestionSerializer(serializers.ModelSerializer):
    order = serializers.IntegerField(required=False)

    class Meta:
        model = TestQuestion
        fields = ["id", "order", "question", "options"]
        read_only_fields = ["id"]


class TestSerializer(serializers.ModelSerializer):
    questions = TestQuestionSerializer(many=True, required=False)
    course_outcomes = serializers.DictField(
        child=serializers.CharField(allow_blank=True),
        required=False,
        default=dict,
    )
    combination_results = serializers.DictField(
        child=serializers.CharField(allow_blank=True),
        required=False,
        default=dict,
    )

    class Meta:
        model = Test
        fields = [
            "id", "title", "description", "category", "published",
            "course_outcomes", "combination_results",
            "created_at", "updated_at", "questions",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        test = Test.objects.create(**validated_data)
        for i, q in enumerate(questions_data):
            q.setdefault("order", i + 1)
            TestQuestion.objects.create(test=test, **q)
        return test

    def update(self, instance, validated_data):
        questions_data = validated_data.pop("questions", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if questions_data is not None:
            instance.questions.all().delete()
            for i, q in enumerate(questions_data):
                q.setdefault("order", i + 1)
                TestQuestion.objects.create(test=instance, **q)
        return instance


class TestResultSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    test_title = serializers.CharField(source="test.title", read_only=True)

    class Meta:
        model = TestResult
        fields = [
            "id", "user", "user_email", "test", "test_title",
            "answers", "score", "recommended_course", "recommendation_why",
            "completed_at",
        ]
        read_only_fields = ["id", "score", "recommended_course", "recommendation_why", "completed_at"]


class SubmitAnswersSerializer(serializers.Serializer):
    answers = serializers.DictField(
        child=serializers.IntegerField(),
        help_text="Map of question_id (str) → chosen option index (int)",
    )
