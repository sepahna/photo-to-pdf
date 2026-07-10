document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('btn-add-contact');
    const requestsBtn = document.getElementById('btn-requests');
    const modalAdd = document.getElementById('modal-add-contact');
    const modalRequests = document.getElementById('modal-requests');
    const searchInput = document.getElementById('search-input');

    if (addBtn && modalAdd) {
        addBtn.addEventListener('click', () => modalAdd.classList.add('active'));
    }
    if (requestsBtn && modalRequests) {
        requestsBtn.addEventListener('click', () => modalRequests.classList.add('active'));
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.close;
            document.getElementById(modalId)?.classList.remove('active');
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            document.querySelectorAll('.chat-item').forEach(item => {
                const name = item.dataset.name?.toLowerCase() || '';
                item.style.display = name.includes(query) ? '' : 'none';
            });
        });
    }
});
