from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('phone_number', 'display_name', 'is_active')
    search_fields = ('phone_number', 'display_name')
    ordering = ('phone_number',)
    fieldsets = UserAdmin.fieldsets + (
        ('اطلاعات تماس', {'fields': ('phone_number', 'display_name')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'display_name', 'password1', 'password2'),
        }),
    )
