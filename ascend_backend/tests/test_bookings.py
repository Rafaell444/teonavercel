import pytest
from django.urls import reverse

from .factories import AdminUserFactory, BookingFactory, CourseFactory, UserFactory


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
class TestBookingTotal:
    def test_total_auto_computed(self, client):
        user = UserFactory()
        course = CourseFactory(price="200.00")
        headers = auth_headers(client, user)
        payload = {
            "course_id": str(course.id),
            "date": "Apr 01, 2026",
            "time": "09:00",
            "format": "online",
            "months": 3,
        }
        resp = client.post(
            reverse("bookings-list"),
            payload,
            content_type="application/json",
            **headers,
        )
        assert resp.status_code == 201
        assert float(resp.json()["total"]) == 600.0


@pytest.mark.django_db
class TestBookingStatusAdmin:
    def test_member_cannot_update_status(self, client):
        member = UserFactory()
        booking = BookingFactory(user=member)
        headers = auth_headers(client, member)
        url = reverse("bookings-status", args=[booking.id])
        resp = client.patch(
            url, {"status": "Confirmed"}, content_type="application/json", **headers
        )
        assert resp.status_code == 403

    def test_admin_can_update_status(self, client):
        admin = AdminUserFactory()
        member = UserFactory()
        booking = BookingFactory(user=member)
        headers = auth_headers(client, admin)
        url = reverse("bookings-status", args=[booking.id])
        resp = client.patch(
            url, {"status": "Confirmed"}, content_type="application/json", **headers
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "Confirmed"

    def test_member_sees_only_own_bookings(self, client):
        alice = UserFactory()
        bob = UserFactory()
        b_alice = BookingFactory(user=alice)
        BookingFactory(user=bob)
        headers = auth_headers(client, alice)
        resp = client.get(reverse("bookings-list"), **headers)
        ids = [b["id"] for b in resp.json()]
        assert str(b_alice.id) in ids
        assert len(ids) == 1
