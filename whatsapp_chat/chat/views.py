from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .models import ContactRequest, Message, are_contacts, get_contacts

User = get_user_model()


@login_required
def home(request):
    contacts = get_contacts(request.user)
    chat_list = []
    for contact in contacts:
        last_msg = Message.objects.filter(
            Q(sender=request.user, recipient=contact) |
            Q(sender=contact, recipient=request.user),
        ).order_by('-timestamp').first()
        unread = Message.objects.filter(
            sender=contact,
            recipient=request.user,
            is_read=False,
        ).count()
        chat_list.append({
            'contact': contact,
            'last_message': last_msg,
            'unread_count': unread,
        })
    chat_list.sort(
        key=lambda x: x['last_message'].timestamp if x['last_message'] else x['contact'].date_joined,
        reverse=True,
    )
    pending_requests = ContactRequest.objects.filter(
        to_user=request.user,
        status=ContactRequest.Status.PENDING,
    ).select_related('from_user')
    return render(request, 'chat/home.html', {
        'chat_list': chat_list,
        'pending_requests': pending_requests,
        'pending_count': pending_requests.count(),
    })


@login_required
@require_POST
def add_contact(request):
    phone = request.POST.get('phone_number', '').strip()
    if not phone:
        messages.error(request, 'لطفاً شماره تلفن را وارد کنید.')
        return redirect('chat:home')
    if phone == request.user.phone_number:
        messages.error(request, 'نمی‌توانید خودتان را اضافه کنید.')
        return redirect('chat:home')
    try:
        target = User.objects.get(phone_number=phone)
    except User.DoesNotExist:
        messages.error(request, 'کاربری با این شماره یافت نشد.')
        return redirect('chat:home')
    if are_contacts(request.user, target):
        messages.info(request, 'این مخاطب قبلاً اضافه شده است.')
        return redirect('chat:chat_room', user_id=target.id)
    existing = ContactRequest.objects.filter(
        Q(from_user=request.user, to_user=target) |
        Q(from_user=target, to_user=request.user),
    ).first()
    if existing:
        if existing.status == ContactRequest.Status.PENDING:
            if existing.from_user == request.user:
                messages.info(request, 'درخواست شما در انتظار تأیید است.')
            else:
                messages.info(request, 'این کاربر قبلاً برای شما درخواست فرستاده. لطفاً آن را بررسی کنید.')
        elif existing.status == ContactRequest.Status.REJECTED:
            existing.status = ContactRequest.Status.PENDING
            existing.from_user = request.user
            existing.to_user = target
            existing.save()
            messages.success(request, 'درخواست مخاطب ارسال شد.')
        return redirect('chat:home')
    ContactRequest.objects.create(from_user=request.user, to_user=target)
    messages.success(request, f'درخواست به {target.display_name} ارسال شد.')
    return redirect('chat:home')


@login_required
@require_POST
def accept_contact(request, request_id):
    contact_req = get_object_or_404(
        ContactRequest,
        id=request_id,
        to_user=request.user,
        status=ContactRequest.Status.PENDING,
    )
    contact_req.status = ContactRequest.Status.ACCEPTED
    contact_req.save()
    messages.success(request, f'مخاطب {contact_req.from_user.display_name} پذیرفته شد.')
    return redirect('chat:chat_room', user_id=contact_req.from_user.id)


@login_required
@require_POST
def reject_contact(request, request_id):
    contact_req = get_object_or_404(
        ContactRequest,
        id=request_id,
        to_user=request.user,
        status=ContactRequest.Status.PENDING,
    )
    contact_req.status = ContactRequest.Status.REJECTED
    contact_req.save()
    messages.info(request, 'درخواست رد شد.')
    return redirect('chat:home')


@login_required
def chat_room(request, user_id):
    contact = get_object_or_404(User, id=user_id)
    if not are_contacts(request.user, contact):
        messages.error(request, 'شما با این کاربر مخاطب نیستید.')
        return redirect('chat:home')
    msg_list = Message.objects.filter(
        Q(sender=request.user, recipient=contact) |
        Q(sender=contact, recipient=request.user),
    ).select_related('sender')
    Message.objects.filter(
        sender=contact,
        recipient=request.user,
        is_read=False,
    ).update(is_read=True)
    return render(request, 'chat/chat_room.html', {
        'contact': contact,
        'messages': msg_list,
    })


@login_required
def message_history(request, user_id):
    contact = get_object_or_404(User, id=user_id)
    if not are_contacts(request.user, contact):
        return JsonResponse({'error': 'دسترسی غیرمجاز'}, status=403)
    msgs = Message.objects.filter(
        Q(sender=request.user, recipient=contact) |
        Q(sender=contact, recipient=request.user),
    ).order_by('timestamp')
    data = [{
        'id': m.id,
        'content': m.content,
        'sender_id': m.sender_id,
        'timestamp': m.timestamp.strftime('%H:%M'),
        'is_mine': m.sender_id == request.user.id,
    } for m in msgs]
    return JsonResponse({'messages': data})
