from django.urls import path

from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/add/', views.add_contact, name='add_contact'),
    path('contact/<int:request_id>/accept/', views.accept_contact, name='accept_contact'),
    path('contact/<int:request_id>/reject/', views.reject_contact, name='reject_contact'),
    path('chat/<int:user_id>/', views.chat_room, name='chat_room'),
    path('api/messages/<int:user_id>/', views.message_history, name='message_history'),
]
