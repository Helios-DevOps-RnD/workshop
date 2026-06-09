document.addEventListener('DOMContentLoaded', () => {
    const guestInput = document.getElementById('guestName');
    const addBtn = document.getElementById('addBtn');
    const guestList = document.getElementById('guestList');

    function renderList() {
        guestList.innerHTML = '';
        const guests = getGuests();

        if (guests.length === 0) {
            guestList.innerHTML = '<div class="empty-state">No guests registered today.</div>';
            return;
        }

        guests.forEach(guest => {
            const li = document.createElement('li');
            li.innerHTML = guest.name;
            
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Remove';
            delBtn.className = 'btn-danger';
            delBtn.onclick = () => {
                deleteGuest(guest.id);
                renderList();
            };
            
            li.appendChild(delBtn);
            guestList.appendChild(li);
        });
    }

    addBtn.addEventListener('click', () => {
        if (addGuest(guestInput.value)) {
            guestInput.value = '';
            renderList();
        }
    });

    guestInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });

    // Inisiasi awal
    renderList();
});