import pytest
from django.urls import reverse

from .factories import AdminUserFactory, UserFactory, VaultItemFactory


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
class TestVaultAccess:
    def test_member_cannot_see_other_members_private_item(self, client):
        alice = UserFactory()
        bob = UserFactory()
        private_item = VaultItemFactory(assigned_to=alice)
        headers = auth_headers(client, bob)
        resp = client.get(reverse("vault-list"), **headers)
        ids = [v["id"] for v in resp.json()]
        assert str(private_item.id) not in ids

    def test_member_can_see_own_private_item(self, client):
        alice = UserFactory()
        own_item = VaultItemFactory(assigned_to=alice)
        headers = auth_headers(client, alice)
        resp = client.get(reverse("vault-list"), **headers)
        ids = [v["id"] for v in resp.json()]
        assert str(own_item.id) in ids

    def test_member_can_see_shared_item(self, client):
        member = UserFactory()
        shared = VaultItemFactory(assigned_to=None)
        headers = auth_headers(client, member)
        resp = client.get(reverse("vault-list"), **headers)
        ids = [v["id"] for v in resp.json()]
        assert str(shared.id) in ids

    def test_admin_sees_all_items(self, client):
        admin = AdminUserFactory()
        alice = UserFactory()
        private = VaultItemFactory(assigned_to=alice)
        shared = VaultItemFactory(assigned_to=None)
        headers = auth_headers(client, admin)
        resp = client.get(reverse("vault-list"), **headers)
        ids = [v["id"] for v in resp.json()]
        assert str(private.id) in ids
        assert str(shared.id) in ids
