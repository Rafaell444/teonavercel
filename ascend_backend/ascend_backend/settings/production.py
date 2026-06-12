from .base import *  # noqa: F401, F403
import environ as _environ

_env = _environ.Env()
_environ.Env.read_env(BASE_DIR / ".env")  # noqa: F405

DEBUG = False

DATABASES = {"default": _env.db("DATABASE_URL")}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": _env("REDIS_URL"),
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
    }
}

DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = _env("EMAIL_HOST", default="email-smtp.eu-west-1.amazonaws.com")
EMAIL_PORT = _env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = _env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = _env("EMAIL_HOST_PASSWORD", default="")

SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
