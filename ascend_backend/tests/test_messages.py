import pytest
from django.urls import reverse
from unittest.mock import patch

from .factories import AdminUserFactory, ContactMessageFactory, UserFactory


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
class TestContactMessages:
    @patch("apps.messages.views.notify_admin_new_message.delay")
    def test_public_post_creates_message_and_fires_task(self, mock_task, client):
        payload = {
            "name": "Test Person",
            "email": "test@example.com",
            "subject": "Hello",
            "message": "I have a question.",
        }
        resp = client.post(
            reverse("messages-list"),
            payload,
            content_type="application/json",
        )
        assert resp.status_code == 201
        assert mock_task.called
        called_with = str(mock_task.call_args[0][0])
        assert resp.json()["id"] == called_with

    def test_unauthenticated_cannot_list_messages(self, client):
        resp = client.get(reverse("messages-list"))
        assert resp.status_code == 403

    def test_admin_can_list_messages(self, client):
        admin = AdminUserFactory()
        ContactMessageFactory.create_batch(3)
        headers = auth_headers(client, admin)
        resp = client.get(reverse("messages-list"), **headers)
        assert resp.status_code == 200
        assert len(resp.json()) == 3

    def test_admin_mark_read(self, client):
        admin = AdminUserFactory()
        msg = ContactMessageFactory(read=False)
        headers = auth_headers(client, admin)
        resp = client.patch(
            reverse("messages-detail", args=[msg.id]),
            content_type="application/json",
            **headers,
        )
        assert resp.status_code == 200
        assert resp.json()["read"] is True

    def test_filter_unread(self, client):
        admin = AdminUserFactory()
        ContactMessageFactory(read=False)
        ContactMessageFactory(read=True)
        headers = auth_headers(client, admin)
        resp = client.get(reverse("messages-list") + "?read=false", **headers)

        assert resp.status_code == 200
        assert all(not m["read"] for m in resp.json())
