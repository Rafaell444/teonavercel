import pytest
from django.urls import reverse

from apps.content.models import SiteSettings

from .factories import AdminUserFactory, SiteSettingsFactory, UserFactory


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
class TestSiteSettings:
    def test_singleton_always_pk1(self):
        s1 = SiteSettings.get()
        assert s1.pk == 1
        s2 = SiteSettings.get()
        assert SiteSettings.objects.count() == 1
        assert s1.pk == s2.pk

    def test_public_can_read_settings(self, client):
        SiteSettingsFactory()
        resp = client.get(reverse("site-settings"))
        assert resp.status_code == 200
        assert "brandName" in resp.json()

    def test_admin_can_patch_settings(self, client):
        SiteSettingsFactory(brand_name="OldName")
        admin = AdminUserFactory()
        headers = auth_headers(client, admin)
        resp = client.patch(
            reverse("site-settings"),
            {"brandName": "NewName"},
            content_type="application/json",
            **headers,
        )
        assert resp.status_code == 200
        assert resp.json()["brandName"] == "NewName"
        assert SiteSettings.objects.count() == 1

    def test_member_cannot_patch_settings(self, client):
        SiteSettingsFactory()
        member = UserFactory()
        headers = auth_headers(client, member)
        resp = client.patch(
            reverse("site-settings"),
            {"brandName": "Hacked"},
            content_type="application/json",
            **headers,
        )
        assert resp.status_code == 403

    def test_camel_case_keys_in_response(self, client):
        SiteSettingsFactory(hero_title="Rise Up", stat_hours="20k+")
        resp = client.get(reverse("site-settings"))
        data = resp.json()
        assert "heroTitle" in data
        assert "statHours" in data
        assert "hero_title" not in data
