import pytest
from django.urls import reverse

from .factories import AdminUserFactory, TestFactory, TestQuestionFactory, UserFactory


def auth_headers(client, user, password="pass"):
    user.set_password(password)
    user.save()
    tokens = client.post(
        reverse("auth-login"),
        {"email": user.email, "password": password},
        content_type="application/json",
    ).json()
    return {"HTTP_AUTHORIZATION": f"Bearer {tokens['access']}"}


@pytest.mark.django_db
class TestSubmitTest:
    def test_correct_answers_score_1(self, client):
        member = UserFactory()
        test = TestFactory()
        q1 = TestQuestionFactory(test=test, order=1, correct=0)
        q2 = TestQuestionFactory(test=test, order=2, correct=1)
        headers = auth_headers(client, member)
        url = reverse("tests-submit", args=[test.id])
        payload = {"answers": {str(q1.id): 0, str(q2.id): 1}}
        resp = client.post(url, payload, content_type="application/json", **headers)
        assert resp.status_code == 201
        assert resp.json()["score"] == 1.0

    def test_all_wrong_score_0(self, client):
        member = UserFactory()
        test = TestFactory()
        q1 = TestQuestionFactory(test=test, order=1, correct=0)
        headers = auth_headers(client, member)
        url = reverse("tests-submit", args=[test.id])
        payload = {"answers": {str(q1.id): 3}}
        resp = client.post(url, payload, content_type="application/json", **headers)
        assert resp.status_code == 201
        assert resp.json()["score"] == 0.0


@pytest.mark.django_db
class TestCorrectFieldHiddenFromMembers:
    def test_member_cannot_see_correct(self, client):
        member = UserFactory()
        test = TestFactory()
        TestQuestionFactory(test=test, order=1, correct=2)
        headers = auth_headers(client, member)
        resp = client.get(reverse("tests-detail", args=[test.id]), **headers)
        assert resp.status_code == 200
        question = resp.json()["questions"][0]
        assert "correct" not in question

    def test_admin_can_see_correct(self, client):
        admin = AdminUserFactory()
        test = TestFactory()
        TestQuestionFactory(test=test, order=1, correct=2)
        headers = auth_headers(client, admin)
        resp = client.get(reverse("tests-detail", args=[test.id]), **headers)
        assert resp.status_code == 200
        question = resp.json()["questions"][0]
        assert "correct" in question
        assert question["correct"] == 2

    def test_unpublished_hidden_from_members(self, client):
        member = UserFactory()
        test = TestFactory(published=False)
        headers = auth_headers(client, member)
        resp = client.get(reverse("tests-list"), **headers)
        ids = [t["id"] for t in resp.json()]
        assert str(test.id) not in ids
