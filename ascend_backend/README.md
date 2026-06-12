# Ascend Backend

Django REST Framework backend for the Ascend coaching platform.

## Tech Stack

- Python 3.12, Django 5.x, Django REST Framework 3.15
- SimpleJWT (access + refresh tokens)
- PostgreSQL 16 (SQLite in dev)
- Redis (Celery broker + cache)
- AWS S3 (file storage)
- Celery (async tasks)

## Quick Start

```bash
# 1. Create & activate a virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows
source .venv/bin/activate    # macOS/Linux

# 2. Install dependencies
pip install -r requirements/local.txt

# 3. Copy and edit the environment file
cp .env.example .env
# Edit .env to set SECRET_KEY (and optionally DATABASE_URL)

# 4. Run migrations
python manage.py migrate

# 5. Seed the database
python manage.py seed

# 6. (Optional) Start Celery worker
celery -A ascend_backend worker -l info

# 7. Start the dev server
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

## Default Seed Credentials

| Role   | Email                | Password      |
|--------|----------------------|---------------|
| Admin  | admin@ascend.com     | admin1234     |
| Member | elena@email.com      | member1234    |
| Member | marcus@email.com     | member1234    |
| Member | aiko@email.com       | member1234    |

## API Endpoints

| Method | Path                              | Auth     |
|--------|-----------------------------------|----------|
| POST   | /api/auth/register/               | Public   |
| POST   | /api/auth/login/                  | Public   |
| POST   | /api/auth/token/refresh/          | Public   |
| POST   | /api/auth/logout/                 | Required |
| GET    | /api/auth/me/                     | Required |
| GET    | /api/users/                       | Admin    |
| PATCH  | /api/users/{id}/                  | Admin    |
| POST   | /api/users/{id}/add-xp/           | Admin    |
| GET    | /api/tests/                       | Required |
| POST   | /api/tests/{id}/submit/           | Required |
| GET    | /api/vault/                       | Required |
| POST   | /api/vault/                       | Admin    |
| GET    | /api/events/                      | Public   |
| GET    | /api/courses/                     | Public   |
| GET    | /api/bookings/                    | Required |
| POST   | /api/bookings/                    | Required |
| GET    | /api/roundtable/seats/            | Public   |
| POST   | /api/roundtable/seats/{n}/claim/  | Required |
| GET    | /api/testimonials/                | Public   |
| GET    | /api/content/pillars/             | Public   |
| GET    | /api/content/settings/            | Public   |
| POST   | /api/messages/                    | Public   |
| GET    | /api/messages/                    | Admin    |
| GET    | /api/diary/                       | Required |
| POST   | /api/diary/                       | Required |

## Running Tests

```bash
pytest
# With coverage report:
pytest --cov=apps --cov-report=html
```

## Project Structure

```
ascend_backend/
├── ascend_backend/
│   ├── settings/
│   │   ├── base.py
│   │   ├── local.py        ← default for dev
│   │   └── production.py
│   ├── urls.py
│   ├── celery.py
│   └── wsgi.py
├── apps/
│   ├── users/          # Auth, permissions, XP/tier
│   ├── tests_app/      # Assessments + scoring
│   ├── vault/          # S3 file vault
│   ├── events/         # Events with S3 images
│   ├── courses/        # Booking course catalogue
│   ├── bookings/       # Session bookings + Celery emails
│   ├── roundtable/     # 12-seat atomic claim system
│   ├── testimonials/   # Public testimonials
│   ├── content/        # Pillars + singleton SiteSettings
│   ├── messages/       # Contact form + Celery notify
│   └── diary/          # Member diary entries
├── tests/
│   ├── factories.py
│   ├── test_auth.py
│   ├── test_users.py
│   ├── test_tests.py
│   ├── test_vault.py
│   ├── test_bookings.py
│   ├── test_roundtable.py
│   ├── test_messages.py
│   └── test_settings.py
├── requirements/
│   ├── base.txt
│   ├── local.txt
│   └── production.txt
└── manage.py
```
