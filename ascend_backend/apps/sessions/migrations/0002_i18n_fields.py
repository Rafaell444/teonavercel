from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("coaching_sessions", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="session",
            name="title_ka",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AddField(
            model_name="session",
            name="description_ka",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="session",
            name="language",
            field=models.CharField(
                choices=[("both", "Both"), ("ka", "Georgian"), ("en", "English")],
                default="both",
                max_length=4,
            ),
        ),
        migrations.AddField(
            model_name="package",
            name="title_ka",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AddField(
            model_name="package",
            name="description_ka",
            field=models.TextField(blank=True, default=""),
        ),
    ]
