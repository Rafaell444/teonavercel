from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tests_app', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='course_outcomes',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='testquestion',
            name='option_courses',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AlterField(
            model_name='testquestion',
            name='correct',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='testresult',
            name='recommended_course',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='testresult',
            name='recommendation_why',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='testresult',
            name='score',
            field=models.FloatField(default=0.0),
        ),
    ]
