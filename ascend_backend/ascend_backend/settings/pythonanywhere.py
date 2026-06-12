"""
Settings for PythonAnywhere free-tier hosting.
- SQLite database (no external Postgres needed)
- Local media/static files served by PA
- No Redis - Celery tasks run synchronously (eager)
- No S3 - file uploads stored on disk
- SSL handled by PythonAnywhere's reverse proxy
"""
from .base import *  # noqa: F401, F403

DEBUG = False

# WhiteNoise serves static files directly from Django (no separate nginx needed)
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Tasks run inline (no Celery worker needed)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# PythonAnywhere sits behind a reverse proxy that handles HTTPS
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = False  # PA proxy handles this
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
