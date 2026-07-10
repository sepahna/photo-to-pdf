import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model

from .models import Message, are_contacts

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        self.contact_id = int(self.scope['url_route']['kwargs']['user_id'])
        self.contact = await self.get_user(self.contact_id)
        if not self.contact or not await self.check_contacts():
            await self.close()
            return
        self.room_name = self._room_name(self.user.id, self.contact_id)
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get('message', '').strip()
        if not content:
            return
        msg = await self.save_message(content)
        await self.channel_layer.group_send(self.room_name, {
            'type': 'chat_message',
            'message': content,
            'sender_id': self.user.id,
            'sender_name': self.user.display_name,
            'timestamp': msg.timestamp.strftime('%H:%M'),
            'message_id': msg.id,
        })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'timestamp': event['timestamp'],
            'message_id': event['message_id'],
            'is_mine': event['sender_id'] == self.user.id,
        }))

    @staticmethod
    def _room_name(id1, id2):
        return f'chat_{min(id1, id2)}_{max(id1, id2)}'

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def check_contacts(self):
        return are_contacts(self.user, self.contact)

    @database_sync_to_async
    def save_message(self, content):
        return Message.objects.create(
            sender=self.user,
            recipient=self.contact,
            content=content,
        )
