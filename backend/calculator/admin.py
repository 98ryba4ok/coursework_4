from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, NIHSSCalculation


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'is_active', 'is_staff', 'created_at')
    list_filter = ('is_active', 'is_staff')
    search_fields = ('email', 'full_name')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Персональные данные', {'fields': ('full_name',)}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2'),
        }),
    )


@admin.register(NIHSSCalculation)
class NIHSSCalculationAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_score', 'severity', 'patient_age', 'created_at')
    list_filter = ('severity',)
    search_fields = ('user__email',)
    ordering = ('-created_at',)
    readonly_fields = ('id', 'total_score', 'severity', 'interpretation', 'created_at')
