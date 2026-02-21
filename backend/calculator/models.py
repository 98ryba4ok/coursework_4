import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.email


class NIHSSCalculation(models.Model):
    """Запись оценки по шкале NIHSS"""

    SEVERITY_CHOICES = [
        ('no_stroke', 'Нет признаков инсульта'),
        ('minor', 'Малый инсульт'),
        ('moderate', 'Умеренный инсульт'),
        ('moderate_severe', 'Умеренно тяжёлый инсульт'),
        ('severe', 'Тяжёлый инсульт'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calculations')

    # Параметры пациента
    patient_age = models.PositiveIntegerField()
    patient_notes = models.TextField(blank=True, default='')

    # Шкала NIHSS — 15 пунктов
    # 1. Уровень сознания
    loc = models.PositiveSmallIntegerField(default=0)           # 1a, 0-3
    loc_questions = models.PositiveSmallIntegerField(default=0) # 1b, 0-2
    loc_commands = models.PositiveSmallIntegerField(default=0)  # 1c, 0-2
    # 2. Взор
    best_gaze = models.PositiveSmallIntegerField(default=0)     # 0-2
    # 3. Поля зрения
    visual = models.PositiveSmallIntegerField(default=0)        # 0-3
    # 4. Лицевой паралич
    facial_palsy = models.PositiveSmallIntegerField(default=0)  # 0-3
    # 5. Двигательные функции рук
    motor_arm_left = models.PositiveSmallIntegerField(default=0)  # 0-4
    motor_arm_right = models.PositiveSmallIntegerField(default=0) # 0-4
    # 6. Двигательные функции ног
    motor_leg_left = models.PositiveSmallIntegerField(default=0)  # 0-4
    motor_leg_right = models.PositiveSmallIntegerField(default=0) # 0-4
    # 7. Атаксия конечностей
    limb_ataxia = models.PositiveSmallIntegerField(default=0)   # 0-2
    # 8. Чувствительность
    sensory = models.PositiveSmallIntegerField(default=0)       # 0-2
    # 9. Речь
    best_language = models.PositiveSmallIntegerField(default=0) # 0-3
    # 10. Дизартрия
    dysarthria = models.PositiveSmallIntegerField(default=0)    # 0-2
    # 11. Угасание и невнимательность
    extinction = models.PositiveSmallIntegerField(default=0)    # 0-2

    # Результаты
    total_score = models.PositiveSmallIntegerField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    interpretation = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'nihss_calculations'
        ordering = ['-created_at']
        verbose_name = 'Оценка NIHSS'
        verbose_name_plural = 'Оценки NIHSS'

    def __str__(self):
        return f'{self.user.email} — {self.total_score} баллов ({self.get_severity_display()})'
