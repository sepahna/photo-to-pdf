document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('messages-container');
    const form = document.getElementById('message-form');
    const input = document.getElementById('message-input');
    const statusEl = document.getElementById('connection-status');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/${CONTACT_ID}/`;
    const socket = new WebSocket(wsUrl);

    const displayedIds = new Set();
    document.querySelectorAll('.message[data-id]').forEach(el => {
        displayedIds.add(parseInt(el.dataset.id));
    });

    scrollToBottom();

    socket.onopen = () => {
        statusEl.textContent = 'آنلاین';
        statusEl.style.color = '#25D366';
    };

    socket.onclose = () => {
        statusEl.textContent = 'آفلاین';
        statusEl.style.color = '#e74c3c';
    };

    socket.onerror = () => {
        statusEl.textContent = 'خطا در اتصال';
        statusEl.style.color = '#e74c3c';
    };

    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (displayedIds.has(data.message_id)) return;
        displayedIds.add(data.message_id);
        appendMessage(data.content, data.is_mine, data.timestamp);
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ message: text }));
        input.value = '';
    });

    function appendMessage(content, isMine, time) {
        const div = document.createElement('div');
        div.className = `message ${isMine ? 'sent' : 'received'}`;
        div.innerHTML = `
            <div class="message-bubble">
                <p>${escapeHtml(content)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        container.appendChild(div);
        scrollToBottom();
    }

    function scrollToBottom() {
        container.scrollTop = container.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
