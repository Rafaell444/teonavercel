import pytest
from django.urls import reverse

from .factories import UserFactory


@pytest.mark.django_db
class TestRegister:
    def test_register_creates_user_and_returns_tokens(self, client):
        url = reverse("auth-register")
        resp = client.post(
            url,
            {"name": "Alice Smith", "email": "alice@example.com", "password": "secret123"},
            content_type="application/json",
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "access" in data
        assert "refresh" in data
        assert data["user"]["email"] == "alice@example.com"

    def test_register_duplicate_email_returns_400(self, client):
        UserFactory(email="bob@example.com")
        url = reverse("auth-register")
        resp = client.post(
            url,
            {"name": "Bob", "email": "bob@example.com", "password": "secret123"},
            content_type="application/json",
        )
        assert resp.status_code == 400


@pytest.mark.django_db
class TestLogin:
    def test_login_returns_tokens(self, client):
        user = UserFactory(email="charlie@example.com")
        user.set_password("mypassword")
        user.save()
        url = reverse("auth-login")
        resp = client.post(
            url,
            {"email": "charlie@example.com", "password": "mypassword"},
            content_type="application/json",
        )
        assert resp.status_code == 200
        assert "access" in resp.json()

    def test_login_wrong_password_returns_401(self, client):
        user = UserFactory(email="dave@example.com")
        user.set_password("correct")
        user.save()
        url = reverse("auth-login")
        resp = client.post(
            url,
            {"email": "dave@example.com", "password": "wrong"},
            content_type="application/json",
        )
        assert resp.status_code == 401


@pytest.mark.django_db
class TestTokenRefresh:
    def test_refresh_returns_new_access(self, client):
        user = UserFactory()
        user.set_password("pass")
        user.save()
        login_resp = client.post(
            reverse("auth-login"),
            {"email": user.email, "password": "pass"},
            content_type="application/json",
        )
        refresh = login_resp.json()["refresh"]
        resp = client.post(
            reverse("auth-token-refresh"),
            {"refresh": refresh},
            content_type="application/json",
        )
        assert resp.status_code == 200
        assert "access" in resp.json()


@pytest.mark.django_db
class TestProtectedRoute:
    def test_me_without_token_returns_401(self, client):
        resp = client.get(reverse("auth-me"))
        assert resp.status_code == 401

    def test_me_with_token_returns_user(self, client):
        user = UserFactory()
        user.set_password("pass")
        user.save()
        tokens = client.post(
            reverse("auth-login"),
            {"email": user.email, "password": "pass"},
            content_type="application/json",
        ).json()
        resp = client.get(
            reverse("auth-me"),
            HTTP_AUTHORIZATION=f"Bearer {tokens['access']}",
        )
        assert resp.status_code == 200
        assert resp.json()["email"] == user.email
