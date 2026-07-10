from django.conf import settings
from django.db import models
from django.db.models import Q


class ContactRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'در انتظار'
        ACCEPTED = 'accepted', 'پذیرفته شده'
        REJECTED = 'rejected', 'رد شده'

    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_requests',
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_requests',
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.from_user} -> {self.to_user} ({self.status})'


class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages',
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.sender} -> {self.recipient}: {self.content[:30]}'


def are_contacts(user_a, user_b):
    return ContactRequest.objects.filter(
        Q(from_user=user_a, to_user=user_b) | Q(from_user=user_b, to_user=user_a),
        status=ContactRequest.Status.ACCEPTED,
    ).exists()


def get_contacts(user):
    accepted = ContactRequest.objects.filter(
        Q(from_user=user) | Q(to_user=user),
        status=ContactRequest.Status.ACCEPTED,
    ).select_related('from_user', 'to_user')
    contacts = []
    for req in accepted:
        contact = req.to_user if req.from_user == user else req.from_user
        contacts.append(contact)
    return contacts
