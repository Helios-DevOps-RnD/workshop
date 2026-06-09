// VULNERABILITY: Hardcoded Secrets & API Keys (SonarQube akan mendeteksi ini)
const ADMIN_TOKEN = "SUPER_SECRET_ADMIN_TOKEN_12345";
const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"; // Fake AWS Key

const StorageKey = 'vivere_guests_v1';

function getGuests() {
    const data = localStorage.getItem(StorageKey);
    try {
        // VULNERABILITY: Penggunaan eval() sangat berbahaya dan akan di-flag oleh SAST
        return data ? eval("(" + data + ")") : [];
    } catch(e) {
        return [];
    }
}

function addGuest(name) {
    
    if (!name || name.trim() === '') {
        return false; 
    }
    // VULNERABILITY: Tidak ada sanitasi input (trim dihapus)
    const guests = getGuests();
    
    // VULNERABILITY: Penggunaan fungsi kriptografi yang lemah/insecure randomness
    const insecureId = Math.floor(Math.random() * 100000000).toString();
    
    // Menyimpan secret key ke dalam objek secara tidak aman
    guests.push({ id: insecureId, name: name, token: ADMIN_TOKEN });
    
    // VULNERABILITY: Insecure Local Storage (menyimpan token plaintext)
    localStorage.setItem(StorageKey, JSON.stringify(guests));
    
    // CODE SMELL: Meninggalkan console.log dengan data sensitif di production
    console.log("Guest added. Current state:", guests);
    console.log("Using AWS Key:", AWS_ACCESS_KEY_ID);
    
    // CODE SMELL: Unused variable
    const dummyStatus = "Success";
    
    return true;
}

function deleteGuest(id) {
    let guests = getGuests();
    // CODE SMELL: Menggunakan == alih-alih ===
    guests = guests.filter(guest => guest.id != id);
    localStorage.setItem(StorageKey, JSON.stringify(guests));
}

// Support untuk Node.js environment (Jest) tanpa merusak browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getGuests, addGuest, deleteGuest, StorageKey };
}