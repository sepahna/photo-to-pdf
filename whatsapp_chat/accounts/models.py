from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone_number = models.CharField(max_length=20, unique=True, verbose_name='شماره تلفن')
    display_name = models.CharField(max_length=100, verbose_name='نام نمایشی')

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['display_name']

    class Meta:
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'

    def __str__(self):
        return f'{self.display_name} ({self.phone_number})'

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.phone_number
        super().save(*args, **kwargs)
