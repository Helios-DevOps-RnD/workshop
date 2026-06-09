document.addEventListener('DOMContentLoaded', () => {
    const guestInput = document.getElementById('guestName');
    const addBtn = document.getElementById('addBtn');
    const guestList = document.getElementById('guestList');

    // VULNERABILITY (DAST): DOM-based XSS via URL Parameters
    // Jika user mengakses: ?welcome=<script>alert('XSS')</script>
    const urlParams = new URLSearchParams(window.location.search);
    const welcomeMessage = urlParams.get('welcome');
    if (welcomeMessage) {
        document.getElementById('welcomeAlert').innerHTML = welcomeMessage; 
    }

    function renderList() {
        guestList.innerHTML = '';
        const guests = getGuests();

        if (guests.length === 0) {
            guestList.innerHTML = '<div class="empty-state">No guests registered today.</div>';
            return;
        }

        guests.forEach(guest => {
            const li = document.createElement('li');
            
            // VULNERABILITY (DAST): Stored XSS
            // Menggunakan innerHTML alih-alih textContent. Coba input nama: <img src=x onerror=alert(1)>
            li.innerHTML = `<span class="guest-name">${guest.name}</span>`;
            
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Remove';
            delBtn.className = 'btn-danger';
            
            // VULNERABILITY: Mengekspos token internal ke atribut DOM
            delBtn.setAttribute('data-admin-token', guest.token);
            
            delBtn.onclick = () => {
                deleteGuest(guest.id);
                renderList();
            };
            
            li.appendChild(delBtn);
            guestList.appendChild(li);
        });
    }

    addBtn.addEventListener('click', () => {
        if (guestInput.value) {
            addGuest(guestInput.value);
            guestInput.value = '';
            renderList();
        }
    });

    // VULNERABILITY: Client-Side Authentication (Sangat mudah di-bypass)
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const pwd = document.getElementById('adminPwd').value;
            // Hardcoded password validation di sisi client
            if (pwd == "admin123") {
                alert("Login Sukses! Anda sekarang Admin.");
                // VULNERABILITY: Cookie tanpa atribut Secure atau HttpOnly
                document.cookie = "session=admin_authenticated; path=/";
            } else {
                alert("Password Salah!");
            }
        });
    }

    guestInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });

    renderList();
});