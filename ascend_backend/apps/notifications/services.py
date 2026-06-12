"""
Notification services — currently mocked.
Replace with real SMS/Meet/Calendar APIs when ready.
"""
import logging
import uuid

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import NotificationLog

logger = logging.getLogger(__name__)

ADMIN_PHONE = getattr(settings, "ADMIN_PHONE", "+995XXXXXXXXX")


def send_sms(phone: str, message: str, booking_id=None):
    """Mock SMS — logs to console and creates NotificationLog."""
    logger.info(f"[SMS MOCK] To: {phone} | Message: {message}")
    print(f"\n{'='*60}\n[SMS] To: {phone}\n{message}\n{'='*60}\n")
    NotificationLog.objects.create(
        notification_type="sms",
        recipient=phone,
        body=message,
        status="sent",
        sent_at=timezone.now(),
        booking_id=booking_id,
    )


def send_booking_email(booking):
    """Send booking confirmation email to user."""
    subject = f"Booking Confirmed — {booking.session.title}"
    body = (
        f"Hi {booking.user.name or booking.user.email},\n\n"
        f"Your booking for '{booking.session.title}' has been confirmed.\n\n"
        f"Sessions: {booking.num_sessions}\n"
        f"First session: {booking.date} at {booking.time}\n"
        f"Format: {booking.get_format_display()}\n"
        f"Total: ${booking.total}\n"
    )
    if booking.expires_at:
        body += f"Valid until: {booking.expires_at.strftime('%b %d, %Y')}\n"
    if booking.meet_link:
        body += f"\nGoogle Meet link: {booking.meet_link}\n"

    body += "\nThank you for choosing Ascend!"

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.user.email],
        )
        NotificationLog.objects.create(
            notification_type="email",
            recipient=booking.user.email,
            subject=subject,
            body=body,
            status="sent",
            sent_at=timezone.now(),
            booking_id=booking.id,
        )
    except Exception as e:
        logger.error(f"Failed to send booking email: {e}")
        NotificationLog.objects.create(
            notification_type="email",
            recipient=booking.user.email,
            subject=subject,
            body=body,
            status="failed",
            booking_id=booking.id,
        )


def generate_meet_link():
    """Generate a mocked Google Meet link."""
    short = str(uuid.uuid4()).replace("-", "")[:12]
    return f"https://meet.google.com/mock-{short[:3]}-{short[3:7]}-{short[7:]}"


def send_calendar_invite(booking_session):
    """Mock calendar invite — logs details."""
    booking = booking_session.booking
    session = booking.session

    if booking_session.format == "offline":
        location = session.location or "Tbilisi, Georgia"
        maps_url = session.location_maps_url or ""
        body = (
            f"Calendar Invite for: {session.title}\n"
            f"Date: {booking_session.date}\n"
            f"Time: {booking_session.time}\n"
            f"Location: {location}\n"
            f"Google Maps: {maps_url}\n"
        )
    else:
        body = (
            f"Calendar Invite for: {session.title}\n"
            f"Date: {booking_session.date}\n"
            f"Time: {booking_session.time}\n"
            f"Format: Online\n"
            f"Meet Link: {booking_session.meet_link}\n"
        )

    logger.info(f"[CALENDAR INVITE MOCK] {body}")
    print(f"\n{'='*60}\n[CALENDAR INVITE]\n{body}{'='*60}\n")

    NotificationLog.objects.create(
        notification_type="calendar_invite",
        recipient=booking.user.email,
        subject=f"Session: {session.title}",
        body=body,
        status="sent",
        sent_at=timezone.now(),
        booking_id=booking.id,
    )


def notify_booking_created(booking):
    """Called when a new booking is created — sends SMS to admin + email to user."""
    sms_message = (
        f"New booking! {booking.user.name or booking.user.email} "
        f"booked '{booking.session.title}' "
        f"({booking.num_sessions} sessions, {booking.format}). "
        f"Date: {booking.date}, Time: {booking.time}. "
        f"Total: ${booking.total}"
    )
    send_sms(ADMIN_PHONE, sms_message, booking_id=booking.id)
    send_booking_email(booking)


def notify_session_scheduled(booking_session):
    """Called when a user schedules their next session."""
    booking = booking_session.booking

    sms_message = (
        f"Session #{booking_session.session_number} scheduled! "
        f"{booking.user.name or booking.user.email} — "
        f"'{booking.session.title}' on {booking_session.date} at {booking_session.time} "
        f"({booking_session.format})"
    )
    send_sms(ADMIN_PHONE, sms_message, booking_id=booking.id)
    send_calendar_invite(booking_session)
