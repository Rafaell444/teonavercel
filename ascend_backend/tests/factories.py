import factory
from django.utils import timezone

from apps.bookings.models import Booking
from apps.content.models import Pillar, SiteSettings
from apps.diary.models import DiaryEntry
from apps.events.models import Event
from apps.messages.models import ContactMessage
from apps.sessions.models import GroupSessionSeat, GroupSessionSchedule, Session
from apps.testimonials.models import Testimonial
from apps.tests_app.models import Test, TestQuestion, TestResult
from apps.users.models import User
from apps.vault.models import VaultItem


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    name = factory.Sequence(lambda n: f"User {n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    password = factory.PostGenerationMethodCall("set_password", "password123")
    role = "member"
    tier = "Explorer"
    xp = 0
    vouchers = 0
    is_active = True


class AdminUserFactory(UserFactory):
    role = "admin"
    tier = "Luminary"
    xp = 10000
    is_staff = True


class SessionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Session

    title = factory.Sequence(lambda n: f"Session {n}")
    price = factory.Sequence(lambda n: 100 + n * 10)
    session_type = "individual"
    format = "online"


class EventFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Event

    title = factory.Sequence(lambda n: f"Event {n}")
    type = "Live Seminar"
    date = "Mar 14, 2026"
    location = "Online"
    seats = "50 seats"


class TestFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Test

    title = factory.Sequence(lambda n: f"Test {n}")
    description = "Test description"
    category = "General"
    published = True


class TestQuestionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TestQuestion

    test = factory.SubFactory(TestFactory)
    order = factory.Sequence(lambda n: n + 1)
    question = factory.Sequence(lambda n: f"Question {n}?")
    options = ["Option A", "Option B", "Option C", "Option D"]
    correct = 0


class TestResultFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TestResult

    user = factory.SubFactory(UserFactory)
    test = factory.SubFactory(TestFactory)
    answers = {}
    score = 0.75


class VaultItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = VaultItem

    title = factory.Sequence(lambda n: f"Vault Item {n}")
    kind = "PDF · 10 pages"
    category = "Resource"
    locked = False
    added_by = factory.SubFactory(AdminUserFactory)
    assigned_to = None


class BookingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Booking

    user = factory.SubFactory(UserFactory)
    session = factory.SubFactory(SessionFactory)
    date = "Mar 14, 2026"
    time = "10:00"
    format = "online"
    num_sessions = 3
    status = "Pending"


class GroupSessionScheduleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GroupSessionSchedule

    session = factory.SubFactory(SessionFactory)
    date = factory.LazyFunction(lambda: timezone.now().date())
    start_time = "10:00"
    format = "offline"


class GroupSessionSeatFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GroupSessionSeat

    schedule = factory.SubFactory(GroupSessionScheduleFactory)
    seat_number = factory.Sequence(lambda n: n + 1)
    user = None
    reserved_at = None


class TestimonialFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Testimonial

    quote = "Great coaching!"
    name = factory.Sequence(lambda n: f"Client {n}")
    role = "CEO"
    order = factory.Sequence(lambda n: n)


class PillarFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Pillar

    title = factory.Sequence(lambda n: f"Pillar {n}")
    blurb = "A great pillar"
    points = ["Point 1", "Point 2"]
    order = factory.Sequence(lambda n: n)


class ContactMessageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ContactMessage

    name = factory.Sequence(lambda n: f"Person {n}")
    email = factory.Sequence(lambda n: f"person{n}@example.com")
    subject = "Inquiry"
    message = "Hello there"
    read = False


class DiaryEntryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DiaryEntry

    user = factory.SubFactory(UserFactory)
    date = factory.LazyFunction(lambda: timezone.now().date())
    title = "My Entry"
    excerpt = "Some thoughts..."
    mood = "Calm"


class SiteSettingsFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SiteSettings
        django_get_or_create = ("pk",)

    pk = 1
    brand_name = "Ascend"
    hero_title = "Test Hero"
    contact_email = "hello@ascend.co"
