from django.contrib import admin

from .models import ConsultationBooking, ConsultationSlot

admin.site.register(ConsultationSlot)
admin.site.register(ConsultationBooking)
