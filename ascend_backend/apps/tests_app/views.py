from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminRole

from .models import Test, TestResult
from .serializers import (
    SubmitAnswersSerializer,
    TestResultSerializer,
    TestSerializer,
)


class TestListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated and request.user.role == "admin":
            qs = Test.objects.prefetch_related("questions").all()
        else:
            qs = Test.objects.prefetch_related("questions").filter(published=True)
        return Response(TestSerializer(qs, many=True, context={"request": request}).data)

    def post(self, request):
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = TestSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, pk, request):
        try:
            if request.user.role == "admin":
                return Test.objects.prefetch_related("questions").get(pk=pk)
            return Test.objects.prefetch_related("questions").get(pk=pk, published=True)
        except Test.DoesNotExist:
            return None

    def get(self, request, pk):
        test = self._get(pk, request)
        if not test:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TestSerializer(test, context={"request": request}).data)

    def put(self, request, pk):
        if request.user.role != "admin":
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            test = Test.objects.prefetch_related("questions").get(pk=pk)
        except Test.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TestSerializer(test, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        if request.user.role != "admin":
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            test = Test.objects.get(pk=pk)
        except Test.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TestSerializer(test, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        if request.user.role != "admin":
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            test = Test.objects.get(pk=pk)
        except Test.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        test.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SubmitTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            test = Test.objects.prefetch_related("questions").get(pk=pk, published=True)
        except Test.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = SubmitAnswersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answers = serializer.validated_data["answers"]

        # Build combination key from answers in question order
        questions = list(test.questions.all())
        combo_parts = []
        for question in questions:
            chosen = answers.get(str(question.id))
            combo_parts.append(str(chosen) if chosen is not None else "0")
        combo_key = ",".join(combo_parts)

        combination_results = test.combination_results or {}
        recommended_course = combination_results.get(combo_key, "")
        recommendation_why = ""
        if recommended_course:
            recommendation_why = (test.course_outcomes or {}).get(recommended_course, "")

        result = TestResult.objects.create(
            user=request.user,
            test=test,
            answers=answers,
            score=0.0,
            recommended_course=recommended_course,
            recommendation_why=recommendation_why,
        )
        return Response(TestResultSerializer(result).data, status=status.HTTP_201_CREATED)


class TestResultsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, pk):
        try:
            test = Test.objects.get(pk=pk)
        except Test.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        results = TestResult.objects.filter(test=test).select_related("user")
        return Response(TestResultSerializer(results, many=True).data)
