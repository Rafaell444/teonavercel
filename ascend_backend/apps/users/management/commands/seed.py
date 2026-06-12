import uuid
from datetime import date, time

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed the database with initial demo data"

    def handle(self, *args, **options):
        self._seed_users()
        self._seed_sessions()
        self._seed_events()
        self._seed_testimonials()
        self._seed_pillars()
        self._seed_tests()
        self._seed_site_settings()
        self._seed_group_sessions()
        self._seed_vault()
        self._seed_bookings()
        self._seed_messages()
        self.stdout.write(self.style.SUCCESS("Database seeded successfully."))

    def _seed_users(self):
        from apps.users.models import User

        admin_data = {
            "id": uuid.UUID("00000000-0000-0000-0000-000000000001"),
            "name": "Teona Admin",
            "email": "admin@ascend.com",
            "role": "admin",
            "tier": "Luminary",
            "xp": 9999,
            "vouchers": 0,
            "is_staff": True,
            "is_superuser": True,
        }
        admin, created = User.objects.get_or_create(
            email=admin_data["email"],
            defaults={k: v for k, v in admin_data.items() if k != "email"},
        )
        if created:
            admin.set_password("admin1234")
            admin.save()
            self.stdout.write(f"  Created admin: {admin.email}")

        members = [
            {
                "id": uuid.UUID("00000000-0000-0000-0000-000000000002"),
                "name": "Elena Voss",
                "email": "elena@email.com",
                "role": "member",
                "tier": "Achiever",
                "xp": 2840,
                "vouchers": 3,
            },
            {
                "id": uuid.UUID("00000000-0000-0000-0000-000000000003"),
                "name": "Marcus Reed",
                "email": "marcus@email.com",
                "role": "member",
                "tier": "Explorer",
                "xp": 640,
                "vouchers": 1,
            },
            {
                "id": uuid.UUID("00000000-0000-0000-0000-000000000004"),
                "name": "Aiko Tanaka",
                "email": "aiko@email.com",
                "role": "member",
                "tier": "Master",
                "xp": 5120,
                "vouchers": 5,
            },
        ]
        for data in members:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={k: v for k, v in data.items() if k != "email"},
            )
            if created:
                user.set_password("member1234")
                user.save()
                self.stdout.write(f"  Created member: {user.email}")

    def _seed_sessions(self):
        from apps.sessions.models import Session, SessionTimeSlot

        individual_sessions = [
            (uuid.UUID("10000000-0000-0000-0000-000000000001"), "Executive Coaching", "480.00", "individual"),
            (uuid.UUID("10000000-0000-0000-0000-000000000002"), "RTT Therapy", "360.00", "individual"),
            (uuid.UUID("10000000-0000-0000-0000-000000000003"), "NLP Mastery", "420.00", "individual"),
            (uuid.UUID("10000000-0000-0000-0000-000000000004"), "Generative Coaching", "390.00", "individual"),
        ]
        for sid, title, price, stype in individual_sessions:
            session, created = Session.objects.get_or_create(
                id=sid,
                defaults={"title": title, "price": price, "session_type": stype, "format": "online"},
            )
            if created:
                for day_offset in range(7, 60, 7):
                    d = date.today()
                    from datetime import timedelta
                    slot_date = d + timedelta(days=day_offset)
                    for t in [time(9, 0), time(10, 30), time(13, 0), time(15, 30)]:
                        SessionTimeSlot.objects.get_or_create(
                            session=session,
                            date=slot_date,
                            start_time=t,
                            defaults={"end_time": time(t.hour + 1, t.minute)},
                        )
        self.stdout.write(f"  Sessions: {Session.objects.count()}")

    def _seed_events(self):
        from apps.events.models import Event

        events = [
            {
                "id": uuid.UUID("20000000-0000-0000-0000-000000000001"),
                "title": "Unleash the Inner Edge",
                "type": "Live Seminar",
                "date": "Mar 14, 2026",
                "location": "Lisbon · In-Person",
                "seats": "120 seats",
            },
            {
                "id": uuid.UUID("20000000-0000-0000-0000-000000000002"),
                "title": "Stillness & Strategy Retreat",
                "type": "Weekend Retreat",
                "date": "Apr 02, 2026",
                "location": "Azores · Retreat",
                "seats": "24 seats",
            },
            {
                "id": uuid.UUID("20000000-0000-0000-0000-000000000003"),
                "title": "Deep Work: 1:1 Intensive",
                "type": "Private Session",
                "date": "Ongoing",
                "location": "Online · Worldwide",
                "seats": "By application",
            },
        ]
        for data in events:
            Event.objects.get_or_create(id=data["id"], defaults={k: v for k, v in data.items() if k != "id"})
        self.stdout.write(f"  Events: {Event.objects.count()}")

    def _seed_testimonials(self):
        from apps.testimonials.models import Testimonial

        testimonials = [
            {
                "id": uuid.UUID("30000000-0000-0000-0000-000000000001"),
                "quote": "I walked in carrying years of doubt and walked out with a plan I actually believed in.",
                "name": "Sofia Marchetti",
                "role": "Founder, Northbound Studio",
                "order": 1,
            },
            {
                "id": uuid.UUID("30000000-0000-0000-0000-000000000002"),
                "quote": "The RTT session unlocked something I had been circling for a decade.",
                "name": "David Okonkwo",
                "role": "Managing Director",
                "order": 2,
            },
            {
                "id": uuid.UUID("30000000-0000-0000-0000-000000000003"),
                "quote": "Less hype, more depth. The coaching was genuinely transformative for my leadership.",
                "name": "Hana Lindqvist",
                "role": "VP of Product",
                "order": 3,
            },
        ]
        for data in testimonials:
            Testimonial.objects.get_or_create(id=data["id"], defaults={k: v for k, v in data.items() if k != "id"})
        self.stdout.write(f"  Testimonials: {Testimonial.objects.count()}")

    def _seed_pillars(self):
        from apps.content.models import Pillar

        pillars = [
            {
                "id": uuid.UUID("40000000-0000-0000-0000-000000000001"),
                "title": "Executive Coaching",
                "blurb": "Sharpen decision-making, presence, and performance for high-stakes leadership.",
                "points": ["Leadership identity", "Strategic clarity", "Peak performance"],
                "order": 1,
            },
            {
                "id": uuid.UUID("40000000-0000-0000-0000-000000000002"),
                "title": "RTT Therapy",
                "blurb": "Rapid Transformational Therapy to rewire limiting beliefs at the source.",
                "points": ["Subconscious work", "Belief rewiring", "Lasting change"],
                "order": 2,
            },
            {
                "id": uuid.UUID("40000000-0000-0000-0000-000000000003"),
                "title": "NLP Mastery",
                "blurb": "Neuro-Linguistic Programming tools to shift patterns and communicate with power.",
                "points": ["Language patterns", "State control", "Reframing"],
                "order": 3,
            },
            {
                "id": uuid.UUID("40000000-0000-0000-0000-000000000004"),
                "title": "Generative Coaching",
                "blurb": "Create new futures from a place of wholeness, creativity, and intention.",
                "points": ["Vision building", "Creative flow", "Embodied growth"],
                "order": 4,
            },
        ]
        for data in pillars:
            Pillar.objects.get_or_create(id=data["id"], defaults={k: v for k, v in data.items() if k != "id"})
        self.stdout.write(f"  Pillars: {Pillar.objects.count()}")

    def _seed_tests(self):
        from apps.tests_app.models import Test, TestQuestion

        tests = [
            {
                "id": uuid.UUID("50000000-0000-0000-0000-000000000001"),
                "title": "Find Your Path",
                "description": "A quick reflection to match you with the right coaching style.",
                "category": "Self-discovery",
                "published": True,
                "questions": [
                    {
                        "order": 1,
                        "question": "When you imagine real change, what feels most alive?",
                        "options": ["Breaking through a long-held fear", "Building a bold new vision", "Finding calm and steadiness", "Leading others with clarity"],
                        "correct": 0,
                    },
                    {
                        "order": 2,
                        "question": "Where do you feel the most friction right now?",
                        "options": ["My inner self-talk", "My career direction", "My relationships", "My energy and focus"],
                        "correct": 1,
                    },
                ],
            },
        ]
        for data in tests:
            questions_data = data.pop("questions")
            test, created = Test.objects.get_or_create(
                id=data["id"],
                defaults={k: v for k, v in data.items() if k != "id"},
            )
            if created:
                for q in questions_data:
                    TestQuestion.objects.create(test=test, **q)
        self.stdout.write(f"  Tests: {Test.objects.count()}")

    def _seed_site_settings(self):
        from apps.content.models import SiteSettings

        SiteSettings.objects.get_or_create(
            pk=1,
            defaults={
                "brand_name": "Ascend",
                "hero_badge": "Trusted by 12,000+ clients worldwide",
                "hero_title": "Become the person your",
                "hero_highlight": "future",
                "hero_subtitle": "Premium one-on-one coaching, transformational therapy, and live seminars.",
                "footer_tagline": "Premium coaching and transformational therapy for leaders and founders.",
                "contact_email": "hello@ascend.co",
                "contact_phone": "+1 (415) 555-0148",
                "contact_location": "Lisbon · Online Worldwide",
                "stat_hours": "20k+",
                "stat_lives": "12k+",
                "stat_return": "98%",
            },
        )
        self.stdout.write("  SiteSettings: seeded")

    def _seed_group_sessions(self):
        from apps.sessions.models import GroupSessionSchedule, GroupSessionSeat, Session

        group_session, created = Session.objects.get_or_create(
            id=uuid.UUID("10000000-0000-0000-0000-000000000010"),
            defaults={
                "title": "The Breakthrough Circle",
                "description": "Group coaching session for shared growth and accountability.",
                "price": "150.00",
                "session_type": "group",
                "format": "online",
                "max_seats": 12,
            },
        )
        if created:
            from datetime import timedelta
            schedule = GroupSessionSchedule.objects.create(
                session=group_session,
                date=date.today() + timedelta(days=14),
                start_time=time(18, 0),
                format="online",
            )
            for i in range(1, 13):
                GroupSessionSeat.objects.create(schedule=schedule, seat_number=i)
        self.stdout.write(f"  Group sessions seeded")

    def _seed_vault(self):
        from apps.users.models import User
        from apps.vault.models import VaultItem

        items = [
            {
                "id": uuid.UUID("60000000-0000-0000-0000-000000000001"),
                "title": "Rewiring the Inner Critic",
                "kind": "Audio · 42 min",
                "category": "Resource",
                "locked": False,
                "assigned_to": None,
            },
            {
                "id": uuid.UUID("60000000-0000-0000-0000-000000000002"),
                "title": "The Identity Shift Workbook",
                "kind": "PDF · 24 pages",
                "category": "Book",
                "locked": False,
                "assigned_to": None,
            },
        ]
        try:
            admin = User.objects.get(email="admin@ascend.com")
            for data in items:
                VaultItem.objects.get_or_create(
                    id=data["id"],
                    defaults={**{k: v for k, v in data.items() if k != "id"}, "added_by": admin},
                )
        except User.DoesNotExist:
            pass
        self.stdout.write(f"  VaultItems: {VaultItem.objects.count()}")

    def _seed_bookings(self):
        from apps.bookings.models import Booking
        from apps.sessions.models import Session
        from apps.users.models import User

        try:
            elena = User.objects.get(email="elena@email.com")
            exec_session = Session.objects.get(title="Executive Coaching")
            Booking.objects.get_or_create(
                id=uuid.UUID("70000000-0000-0000-0000-000000000001"),
                defaults={
                    "user": elena,
                    "session": exec_session,
                    "date": "Mar 14, 2026",
                    "time": "10:30",
                    "format": "online",
                    "num_sessions": 5,
                    "status": "Confirmed",
                },
            )
        except (User.DoesNotExist, Session.DoesNotExist):
            pass
        self.stdout.write(f"  Bookings: {Booking.objects.count()}")

    def _seed_messages(self):
        from apps.messages.models import ContactMessage

        messages = [
            {
                "id": uuid.UUID("80000000-0000-0000-0000-000000000001"),
                "name": "Jordan Blake",
                "email": "jordan@email.com",
                "subject": "Corporate coaching inquiry",
                "message": "Hi! We are a team of 12 looking for ongoing leadership coaching.",
                "read": False,
            },
        ]
        for data in messages:
            ContactMessage.objects.get_or_create(id=data["id"], defaults={k: v for k, v in data.items() if k != "id"})
        self.stdout.write(f"  Messages: {ContactMessage.objects.count()}")
