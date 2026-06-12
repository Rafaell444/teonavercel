from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/users/", include("apps.users.admin_urls")),
    path("api/tests/", include("apps.tests_app.urls")),
    path("api/vault/", include("apps.vault.urls")),
    path("api/events/", include("apps.events.urls")),
    path("api/sessions/", include("apps.sessions.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
    path("api/vouchers/", include("apps.vouchers.urls")),
    path("api/testimonials/", include("apps.testimonials.urls")),
    path("api/content/", include("apps.content.urls")),
    path("api/messages/", include("apps.messages.urls")),
    path("api/diary/", include("apps.diary.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
