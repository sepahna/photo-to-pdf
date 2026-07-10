from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm

from .models import User


class RegisterForm(UserCreationForm):
    phone_number = forms.CharField(
        label='شماره تلفن',
        max_length=20,
        widget=forms.TextInput(attrs={
            'placeholder': 'مثال: 09123456789',
            'dir': 'ltr',
            'class': 'form-input',
        }),
    )
    display_name = forms.CharField(
        label='نام نمایشی',
        max_length=100,
        widget=forms.TextInput(attrs={
            'placeholder': 'نام شما',
            'class': 'form-input',
        }),
    )

    class Meta:
        model = User
        fields = ('phone_number', 'display_name', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-input'


class LoginForm(forms.Form):
    phone_number = forms.CharField(
        label='شماره تلفن',
        max_length=20,
        widget=forms.TextInput(attrs={
            'placeholder': '09123456789',
            'dir': 'ltr',
            'class': 'form-input',
        }),
    )
    password = forms.CharField(
        label='رمز عبور',
        widget=forms.PasswordInput(attrs={'class': 'form-input'}),
    )

    def __init__(self, *args, **kwargs):
        self.user = None
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned = super().clean()
        phone = cleaned.get('phone_number')
        password = cleaned.get('password')
        if phone and password:
            self.user = authenticate(username=phone, password=password)
            if self.user is None:
                raise forms.ValidationError('شماره تلفن یا رمز عبور اشتباه است.')
        return cleaned
