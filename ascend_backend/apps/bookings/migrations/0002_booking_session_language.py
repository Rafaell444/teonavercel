from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="booking",
            name="session_language",
            field=models.CharField(
                choices=[("ka", "Georgian"), ("en", "English")],
                default="ka",
                max_length=2,
            ),
        ),
    ]
