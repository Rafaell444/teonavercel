# Django Backend Build Prompt — Ascend Coaching Platform

## Project Overview

Build a production-ready Django REST Framework backend for **Ascend**, a premium coaching and therapy platform. The frontend is a Next.js 16 single-page application with the following surfaces:

- **Public marketing site** — hero, events carousel, pillars, testimonials, about, footer
- **Auth flows** — login, register, logout (email + password)
- **Member dashboard** — personal stats, XP, diary, schedule, vault (resources/books/tests), bookings
- **Admin panel** — full CMS with 10 tabs: Overview, Users, Tests, Vault, Bookings, Events, Courses, Testimonials, Messages, Content/Settings
- **Booking wizard** — multi-step booking with course, date, time, format (online/offline), month count
- **Round-table group sessions** — seat reservation with capacity management
- **Vibe check / tests** — multi-question self-assessment with scored results
- **About page**, **Contact page** — public-facing, contact form submits a `ContactMessage`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Language | Python 3.12 |
| Framework | Django 5.x + Django REST Framework 3.15 |
| Auth | `djangorestframework-simplejwt` (JWT access + refresh tokens) |
| Database | PostgreSQL 16 (via `psycopg[binary]`) |
| Caching / Rate-limiting | Redis (via `django-redis`) |
| File storage | AWS S3 via `django-storages[s3]` (for vault assets) |
| Email | Django email backend (SMTP or AWS SES) |
| CORS | `django-cors-headers` |
| Env config | `django-environ` |
| Task queue | Celery + Redis broker (for email notifications) |
| Linting | `ruff` |
| Tests | `pytest-django` + `factory_boy` |

---

## Data Models

### `users` app

```python
class User(AbstractBaseUser, PermissionsMixin):
    id           = UUIDField(primary_key=True, default=uuid4)
    name         = CharField(max_length=120)
    email        = EmailField(unique=True)  # USERNAME_FIELD
    role         = CharField(choices=[("admin","Admin"),("member","Member")], default="member")
    tier         = CharField(choices=["Explorer","Achiever","Master","Luminary"], default="Explorer")
    xp           = PositiveIntegerField(default=0)
    vouchers     = PositiveIntegerField(default=0)
    joined       = DateField(auto_now_add=True)
    is_active    = BooleanField(default=True)
    is_staff     = BooleanField(default=False)
```

**Computed property** — `initials`: first two capital letters of name words.

**XP Tier thresholds**: Explorer < 1000, Achiever 1000–4999, Master 5000–9999, Luminary 10000+. Auto-upgrade tier on XP save via `post_save` signal.

---

### `tests` app

```python
class Test(Model):
    id          = UUIDField(primary_key=True)
    title       = CharField(max_length=200)
    description = TextField()
    category    = CharField(max_length=100)
    published   = BooleanField(default=False)
    created_at  = DateTimeField(auto_now_add=True)
    updated_at  = DateTimeField(auto_now=True)

class TestQuestion(Model):
    test    = ForeignKey(Test, related_name="questions", on_delete=CASCADE)
    order   = PositiveSmallIntegerField()
    question = TextField()
    options  = JSONField()        # list[str], length 2–6
    correct  = PositiveSmallIntegerField()  # index into options

class TestResult(Model):
    user       = ForeignKey(User, on_delete=CASCADE)
    test       = ForeignKey(Test, on_delete=CASCADE)
    answers    = JSONField()      # {question_id: chosen_index}
    score      = FloatField()     # 0.0–1.0
    completed_at = DateTimeField(auto_now_add=True)
```

---

### `vault` app

```python
class VaultItem(Model):
    id         = UUIDField(primary_key=True)
    title      = CharField(max_length=200)
    kind       = CharField(max_length=100)   # "PDF · 24 pages", "Video · 18 min"
    category   = CharField(choices=["Test","Book","Resource"])
    locked     = BooleanField(default=False)
    file       = FileField(storage=S3Boto3Storage(), null=True, blank=True)
    added_by   = ForeignKey(User, null=True, on_delete=SET_NULL)
    # null user_id = available to everyone; non-null = private to that user
    assigned_to = ForeignKey(User, null=True, blank=True,
                             related_name="private_vault", on_delete=SET_NULL)
    created_at = DateTimeField(auto_now_add=True)
```

Access rule: a member may only fetch items where `assigned_to=self` OR `assigned_to=null`.

---

### `events` app

```python
class Event(Model):
    id       = UUIDField(primary_key=True)
    title    = CharField(max_length=200)
    type     = CharField(max_length=100)   # "Live Seminar", "Weekend Retreat" …
    date     = CharField(max_length=50)    # stored as display string e.g. "Mar 14, 2026"
    location = CharField(max_length=200)
    seats    = CharField(max_length=100)   # "120 seats", "By application"
    image    = ImageField(storage=S3Boto3Storage(), null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

---

### `courses` app

```python
class Course(Model):
    id    = UUIDField(primary_key=True)
    name  = CharField(max_length=200)
    price = DecimalField(max_digits=8, decimal_places=2)
```

---

### `bookings` app

```python
class Booking(Model):
    id       = UUIDField(primary_key=True)
    user     = ForeignKey(User, on_delete=CASCADE)
    course   = ForeignKey(Course, on_delete=PROTECT)
    date     = CharField(max_length=50)
    time     = CharField(max_length=20)
    format   = CharField(choices=[("online","Online"),("offline","In-Person")])
    months   = PositiveSmallIntegerField()
    total    = DecimalField(max_digits=10, decimal_places=2)
    status   = CharField(choices=["Confirmed","Pending","Cancelled"], default="Pending")
    created_at = DateTimeField(auto_now_add=True)
```

**Auto-compute total** on save: `course.price * months`.

---

### `roundtable` app

```python
class RoundTableSeat(Model):
    seat_number  = PositiveSmallIntegerField(unique=True)
    user         = OneToOneField(User, null=True, blank=True, on_delete=SET_NULL)
    reserved_at  = DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["seat_number"]
```

Seed 12 seats on migration. Claiming a seat sets `user` + `reserved_at`.

---

### `testimonials` app

```python
class Testimonial(Model):
    id    = UUIDField(primary_key=True)
    quote = TextField()
    name  = CharField(max_length=120)
    role  = CharField(max_length=150)
    order = PositiveSmallIntegerField(default=0)
```

---

### `content` app

```python
class Pillar(Model):
    id     = UUIDField(primary_key=True)
    title  = CharField(max_length=150)
    blurb  = TextField()
    points = JSONField()   # list[str]
    order  = PositiveSmallIntegerField(default=0)

class SiteSettings(Model):
    """Singleton — only one row ever exists."""
    brand_name        = CharField(max_length=60, default="Ascend")
    hero_badge        = CharField(max_length=200)
    hero_title        = CharField(max_length=200)
    hero_highlight    = CharField(max_length=100)
    hero_subtitle     = TextField()
    footer_tagline    = TextField()
    contact_email     = EmailField()
    contact_phone     = CharField(max_length=50)
    contact_location  = CharField(max_length=200)
    stat_hours        = CharField(max_length=20)
    stat_lives        = CharField(max_length=20)
    stat_return       = CharField(max_length=20)

    class Meta:
        verbose_name_plural = "Site settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
```

---

### `messages` app

```python
class ContactMessage(Model):
    id      = UUIDField(primary_key=True)
    name    = CharField(max_length=120)
    email   = EmailField()
    subject = CharField(max_length=200)
    message = TextField()
    read    = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
```

On creation, fire a Celery task to email the admin.

---

### `diary` app

```python
class DiaryEntry(Model):
    user    = ForeignKey(User, on_delete=CASCADE)
    date    = DateField()
    title   = CharField(max_length=200)
    excerpt = TextField()
    mood    = CharField(max_length=50)
    created_at = DateTimeField(auto_now_add=True)
```

---

## API Endpoints

All non-public endpoints require `Authorization: Bearer <access_token>`.

Admin-only endpoints require `role == "admin"` (use a custom `IsAdminUser` permission class).

### Auth — `/api/auth/`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register/` | None | Create account, return tokens + user |
| POST | `/login/` | None | Return JWT access + refresh |
| POST | `/token/refresh/` | None | Refresh access token |
| POST | `/logout/` | Bearer | Blacklist refresh token |
| GET | `/me/` | Bearer | Current user profile |
| PATCH | `/me/` | Bearer | Update name, email |

### Users — `/api/users/` (admin only)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all users with filters: `role`, `tier`, `search` |
| GET | `/{id}/` | Retrieve single user |
| PATCH | `/{id}/` | Update tier, xp, vouchers, role |
| DELETE | `/{id}/` | Soft-delete (set `is_active=False`) |
| POST | `/{id}/add-xp/` | Body `{"amount": 500}` — add XP, auto-update tier |

### Tests — `/api/tests/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Bearer | List published tests (members); all tests (admin) |
| POST | `/` | Admin | Create test with nested questions |
| GET | `/{id}/` | Bearer | Retrieve test + questions |
| PUT | `/{id}/` | Admin | Full update |
| PATCH | `/{id}/` | Admin | Partial update (e.g. toggle `published`) |
| DELETE | `/{id}/` | Admin | Delete |
| POST | `/{id}/submit/` | Bearer | Submit answers → compute + store `TestResult`, return score |
| GET | `/{id}/results/` | Admin | All results for a test |

### Vault — `/api/vault/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Bearer | Member: own + shared items. Admin: all items |
| POST | `/` | Admin | Upload new item (multipart for file) |
| DELETE | `/{id}/` | Admin | Remove item |

### Events — `/api/events/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | None | List all events (public) |
| POST | `/` | Admin | Create |
| PATCH | `/{id}/` | Admin | Update |
| DELETE | `/{id}/` | Admin | Delete |

### Courses — `/api/courses/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | None | List all courses (public, used in booking wizard) |
| POST | `/` | Admin | Create |
| PATCH | `/{id}/` | Admin | Update |
| DELETE | `/{id}/` | Admin | Delete |

### Bookings — `/api/bookings/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Bearer | Member: own bookings. Admin: all bookings |
| POST | `/` | Bearer | Create booking (auto-compute total) |
| PATCH | `/{id}/status/` | Admin | Update status |

### Round-table — `/api/roundtable/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/seats/` | None | List all 12 seats with occupancy |
| POST | `/seats/{n}/claim/` | Bearer | Claim a seat (fail if taken) |
| DELETE | `/seats/{n}/claim/` | Bearer | Release own seat |

### Testimonials — `/api/testimonials/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | None | List all (public) |
| POST | `/` | Admin | Create |
| PATCH | `/{id}/` | Admin | Update |
| DELETE | `/{id}/` | Admin | Delete |

### Content — `/api/content/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/pillars/` | None | List pillars (public) |
| POST | `/pillars/` | Admin | Create |
| PATCH | `/pillars/{id}/` | Admin | Update |
| DELETE | `/pillars/{id}/` | Admin | Delete |
| GET | `/settings/` | None | Retrieve singleton SiteSettings |
| PATCH | `/settings/` | Admin | Update settings (partial) |

### Messages — `/api/messages/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List messages, filter `?read=false` |
| POST | `/` | None | Submit contact form (public) |
| PATCH | `/{id}/read/` | Admin | Mark as read |
| DELETE | `/{id}/` | Admin | Delete |

### Diary — `/api/diary/`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Bearer | Own entries, ordered `-date` |
| POST | `/` | Bearer | Create entry |

---

## Serializers — Key Rules

- **UserSerializer**: never expose `password`. Include computed `initials` as `SerializerMethodField`.
- **TestSerializer**: nested `TestQuestionSerializer`. On read, omit `correct` field for non-admin users (prevents cheating).
- **BookingSerializer**: on create, resolve `course` from `course_id`, auto-compute `total`.
- **VaultItemSerializer**: `file` returns a pre-signed S3 URL (time-limited, use `generate_presigned_url`).
- **SiteSettingsSerializer**: camelCase ↔ snake_case conversion using `to_representation` / `to_internal_value` to match the frontend's camelCase keys (`brandName`, `heroTitle`, etc.).

---

## Permissions

```python
class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        owner_field = getattr(obj, "user", getattr(obj, "assigned_to", None))
        return owner_field == request.user
```

---

## Celery Tasks

```python
# tasks.py — messages app
@shared_task
def notify_admin_new_message(message_id: str):
    msg = ContactMessage.objects.get(id=message_id)
    send_mail(
        subject=f"[Ascend] New contact: {msg.subject}",
        message=f"From: {msg.name} <{msg.email}>\n\n{msg.message}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.ADMIN_EMAIL],
    )

# tasks.py — bookings app
@shared_task
def send_booking_confirmation(booking_id: str):
    booking = Booking.objects.select_related("user", "course").get(id=booking_id)
    send_mail(
        subject="Your Ascend booking is confirmed",
        message=f"Hi {booking.user.name},\n\nYour {booking.course.name} session on {booking.date} at {booking.time} is confirmed.\n\nSee you soon.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[booking.user.email],
    )
```

---

## Settings Structure

```
ascend_backend/
  settings/
    base.py       # shared settings
    local.py      # DEBUG=True, SQLite or local Postgres
    production.py # DEBUG=False, RDS Postgres, S3, SES
```

**Key environment variables** (`.env`):

```
SECRET_KEY=
DATABASE_URL=postgres://...
REDIS_URL=redis://localhost:6379/0
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=eu-west-1
ADMIN_EMAIL=admin@ascend.co
DEFAULT_FROM_EMAIL=hello@ascend.co
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://ascend.co
FRONTEND_URL=https://ascend.co
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=30
```

---

## Project Structure

```
ascend_backend/
  manage.py
  ascend_backend/
    settings/
    urls.py          # include all app routers
    wsgi.py
    asgi.py
    celery.py
  apps/
    users/
    tests/
    vault/
    events/
    courses/
    bookings/
    roundtable/
    testimonials/
    content/
    messages/
    diary/
  requirements/
    base.txt
    local.txt
    production.txt
```

---

## URL Config

```python
# urls.py
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/",         include("apps.users.urls")),
    path("api/users/",        include("apps.users.admin_urls")),
    path("api/tests/",        include("apps.tests.urls")),
    path("api/vault/",        include("apps.vault.urls")),
    path("api/events/",       include("apps.events.urls")),
    path("api/courses/",      include("apps.courses.urls")),
    path("api/bookings/",     include("apps.bookings.urls")),
    path("api/roundtable/",   include("apps.roundtable.urls")),
    path("api/testimonials/", include("apps.testimonials.urls")),
    path("api/content/",      include("apps.content.urls")),
    path("api/messages/",     include("apps.messages.urls")),
    path("api/diary/",        include("apps.diary.urls")),
]
```

---

## Frontend Integration Notes

The Next.js frontend currently uses a Zustand-style React Context store (`lib/store.tsx`) with `localStorage` persistence. When migrating to this backend:

1. Replace `login()` / `register()` / `logout()` store methods with calls to `/api/auth/login/`, `/api/auth/register/`, `/api/auth/logout/`.
2. Store the JWT in `httpOnly` cookies (set by a Next.js route handler proxy) — never in `localStorage`.
3. Replace every `useStore()` read with SWR hooks hitting the relevant API endpoint.
4. The `SiteSettings` singleton response must use camelCase keys to match the frontend's `settings.brandName`, `settings.heroTitle`, etc.
5. The admin panel's "Save changes" button in the Content tab should `PATCH /api/content/settings/`.
6. Image uploads in EventsTab and VaultTab should use multipart `POST` with `Content-Type: multipart/form-data`.

---

## Migrations & Seeding

Create a `management/commands/seed.py` that:
- Creates one admin user (`admin@ascend.com` / `admin1234`)
- Seeds 3 sample members
- Seeds all events, courses, testimonials, pillars from the frontend `mock-data.ts` equivalents
- Seeds 2 test assessments (Find Your Path, Resilience Check)
- Seeds default `SiteSettings`
- Seeds 12 `RoundTableSeat` rows

Run with: `python manage.py seed`

---

## Testing Requirements

Write `pytest` tests covering:

- **Auth**: register, login, token refresh, protected route rejection
- **Users**: XP add auto-tiers, member cannot access admin routes
- **Tests**: submit answers returns correct score, `correct` field hidden from members
- **Vault**: member cannot fetch another member's private item
- **Bookings**: total auto-computed correctly, status update admin-only
- **Round-table**: double-claim returns 409
- **Messages**: public POST triggers Celery task, admin PATCH marks read
- **Settings**: singleton upsert always updates row pk=1

Coverage target: 90%+.
