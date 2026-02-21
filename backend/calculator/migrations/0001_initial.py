import uuid
import django.contrib.auth.models
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('full_name', models.CharField(max_length=150)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('groups', models.ManyToManyField(
                    blank=True,
                    related_name='user_set',
                    related_query_name='user',
                    to='auth.group',
                    verbose_name='groups',
                )),
                ('user_permissions', models.ManyToManyField(
                    blank=True,
                    related_name='user_set',
                    related_query_name='user',
                    to='auth.permission',
                    verbose_name='user permissions',
                )),
            ],
            options={
                'verbose_name': 'Пользователь',
                'verbose_name_plural': 'Пользователи',
                'db_table': 'users',
            },
            managers=[
                ('objects', django.contrib.auth.models.BaseUserManager()),
            ],
        ),
        migrations.CreateModel(
            name='NIHSSCalculation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('patient_age', models.PositiveIntegerField()),
                ('patient_notes', models.TextField(blank=True, default='')),
                ('loc', models.PositiveSmallIntegerField(default=0)),
                ('loc_questions', models.PositiveSmallIntegerField(default=0)),
                ('loc_commands', models.PositiveSmallIntegerField(default=0)),
                ('best_gaze', models.PositiveSmallIntegerField(default=0)),
                ('visual', models.PositiveSmallIntegerField(default=0)),
                ('facial_palsy', models.PositiveSmallIntegerField(default=0)),
                ('motor_arm_left', models.PositiveSmallIntegerField(default=0)),
                ('motor_arm_right', models.PositiveSmallIntegerField(default=0)),
                ('motor_leg_left', models.PositiveSmallIntegerField(default=0)),
                ('motor_leg_right', models.PositiveSmallIntegerField(default=0)),
                ('limb_ataxia', models.PositiveSmallIntegerField(default=0)),
                ('sensory', models.PositiveSmallIntegerField(default=0)),
                ('best_language', models.PositiveSmallIntegerField(default=0)),
                ('dysarthria', models.PositiveSmallIntegerField(default=0)),
                ('extinction', models.PositiveSmallIntegerField(default=0)),
                ('total_score', models.PositiveSmallIntegerField()),
                ('severity', models.CharField(
                    choices=[
                        ('no_stroke', 'Нет признаков инсульта'),
                        ('minor', 'Малый инсульт'),
                        ('moderate', 'Умеренный инсульт'),
                        ('moderate_severe', 'Умеренно тяжёлый инсульт'),
                        ('severe', 'Тяжёлый инсульт'),
                    ],
                    max_length=20,
                )),
                ('interpretation', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='calculations',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Оценка NIHSS',
                'verbose_name_plural': 'Оценки NIHSS',
                'db_table': 'nihss_calculations',
                'ordering': ['-created_at'],
            },
        ),
    ]
