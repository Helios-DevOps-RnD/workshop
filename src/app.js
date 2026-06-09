const StorageKey = 'vivere_guests_v1';

function getGuests() {
    const data = localStorage.getItem(StorageKey);
    return data ? JSON.parse(data) : [];
}

function addGuest(name) {
    const cleanName = name.trim();
    if (!cleanName) return false;
    
    const guests = getGuests();
    guests.push({ id: Date.now().toString(), name: cleanName });
    localStorage.setItem(StorageKey, JSON.stringify(guests));
    return true;
}

function deleteGuest(id) {
    let guests = getGuests();
    guests = guests.filter(guest => guest.id !== id);
    localStorage.setItem(StorageKey, JSON.stringify(guests));
}

// Support untuk Node.js environment (Jest) tanpa merusak browserr
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getGuests, addGuest, deleteGuest, StorageKey };
}