from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def notify_admin_new_message(message_id: str):
    from .models import ContactMessage

    msg = ContactMessage.objects.get(id=message_id)
    send_mail(
        subject=f"[Ascend] New contact: {msg.subject}",
        message=f"From: {msg.name} <{msg.email}>\n\n{msg.message}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.ADMIN_EMAIL],
    )
