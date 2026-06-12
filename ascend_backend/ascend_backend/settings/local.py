from .base import *  # noqa: F401, F403

DEBUG = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
    }
}

try:
    import environ as _environ
    _env = _environ.Env()
    _environ.Env.read_env(BASE_DIR / ".env")  # noqa: F405
    if _env("DATABASE_URL", default=""):
        DATABASES = {"default": _env.db("DATABASE_URL")}
except Exception:
    pass

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
