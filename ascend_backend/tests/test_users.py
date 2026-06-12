import pytest
from django.urls import reverse

from apps.users.models import User

from .factories import AdminUserFactory, UserFactory


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
class TestXPAutoTier:
    def test_xp_below_1000_stays_explorer(self):
        user = UserFactory(xp=0)
        user.xp = 500
        user.save()
        user.refresh_from_db()
        assert user.tier == "Explorer"

    def test_xp_1000_becomes_achiever(self):
        user = UserFactory(xp=0)
        user.xp = 1000
        user.recalculate_tier()
        user.save()
        user.refresh_from_db()
        assert user.tier == "Achiever"

    def test_xp_5000_becomes_master(self):
        user = UserFactory(xp=0)
        user.xp = 5000
        user.recalculate_tier()
        user.save()
        user.refresh_from_db()
        assert user.tier == "Master"

    def test_xp_10000_becomes_luminary(self):
        user = UserFactory(xp=0)
        user.xp = 10000
        user.recalculate_tier()
        user.save()
        user.refresh_from_db()
        assert user.tier == "Luminary"


@pytest.mark.django_db
class TestMemberCannotAccessAdminRoutes:
    def test_member_cannot_list_users(self, client):
        member = UserFactory()
        headers = auth_headers(client, member)
        resp = client.get(reverse("admin-users-list"), **headers)
        assert resp.status_code == 403

    def test_admin_can_list_users(self, client):
        admin = AdminUserFactory()
        headers = auth_headers(client, admin)
        resp = client.get(reverse("admin-users-list"), **headers)
        assert resp.status_code == 200


@pytest.mark.django_db
class TestAddXP:
    def test_add_xp_updates_user(self, client):
        admin = AdminUserFactory()
        member = UserFactory(xp=0)
        headers = auth_headers(client, admin)
        url = reverse("admin-users-add-xp", args=[member.id])
        resp = client.post(url, {"amount": 1500}, content_type="application/json", **headers)
        assert resp.status_code == 200
        member.refresh_from_db()
        assert member.xp == 1500

    def test_initials_computed_correctly(self):
        user = UserFactory(name="Elena Voss")
        assert user.initials == "EV"

    def test_initials_single_name(self):
        user = UserFactory(name="Madonna")
        assert user.initials == "M"
