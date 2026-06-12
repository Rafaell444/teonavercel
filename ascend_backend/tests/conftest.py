import django
import pytest

pytest_plugins = []


@pytest.fixture
def client(db):
    from django.test import Client
    return Client()
