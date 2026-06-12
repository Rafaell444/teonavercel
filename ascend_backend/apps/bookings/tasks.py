from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_booking_confirmation(booking_id: str):
    from .models import Booking

    booking = Booking.objects.select_related("user", "session").get(id=booking_id)
    send_mail(
        subject="Your Ascend booking is confirmed",
        message=(
            f"Hi {booking.user.name},\n\n"
            f"Your {booking.session.title} session on {booking.date} at {booking.time} is confirmed.\n"
            f"Sessions purchased: {booking.num_sessions}\n"
            f"Expires: {booking.expires_at.strftime('%b %d, %Y') if booking.expires_at else 'N/A'}\n\n"
            "See you soon."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[booking.user.email],
    )
