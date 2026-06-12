import pytest
from django.urls import reverse

from .factories import RoundTableSeatFactory, UserFactory


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
class TestRoundTableClaim:
    def test_claim_empty_seat_succeeds(self, client):
        user = UserFactory()
        RoundTableSeatFactory(seat_number=1, user=None)
        headers = auth_headers(client, user)
        resp = client.post(
            reverse("roundtable-claim", args=[1]),
            **headers,
        )
        assert resp.status_code == 200
        assert resp.json()["user"] == str(user.id)

    def test_double_claim_returns_409(self, client):
        alice = UserFactory()
        bob = UserFactory()
        RoundTableSeatFactory(seat_number=2, user=alice)
        headers = auth_headers(client, bob)
        resp = client.post(
            reverse("roundtable-claim", args=[2]),
            **headers,
        )
        assert resp.status_code == 409

    def test_user_cannot_claim_two_seats(self, client):
        user = UserFactory()
        seat1 = RoundTableSeatFactory(seat_number=3, user=user)
        RoundTableSeatFactory(seat_number=4, user=None)
        headers = auth_headers(client, user)
        resp = client.post(
            reverse("roundtable-claim", args=[4]),
            **headers,
        )
        assert resp.status_code == 409

    def test_release_seat(self, client):
        user = UserFactory()
        RoundTableSeatFactory(seat_number=5, user=user)
        headers = auth_headers(client, user)
        resp = client.delete(
            reverse("roundtable-claim", args=[5]),
            **headers,
        )
        assert resp.status_code == 204

    def test_public_can_list_seats(self, client):
        RoundTableSeatFactory(seat_number=6)
        resp = client.get(reverse("roundtable-seats"))
        assert resp.status_code == 200
