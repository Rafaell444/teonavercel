from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0004_certificate"),
    ]

    operations = [
        migrations.AddField(
            model_name="pillar",
            name="title_ka",
            field=models.CharField(blank=True, default="", max_length=150),
        ),
        migrations.AddField(
            model_name="pillar",
            name="blurb_ka",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="pillar",
            name="points_ka",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="pillar",
            name="long_description_ka",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="pillar",
            name="history_ka",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="hero_badge_ka",
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="hero_title_ka",
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="hero_highlight_ka",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="hero_subtitle_ka",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="footer_tagline_ka",
            field=models.TextField(blank=True),
        ),
    ]
