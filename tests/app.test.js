const { getGuests, addGuest, deleteGuest, StorageKey } = require('../src/app');
const StorageLayer = require('../src/data/storage');
const AuthService = require('../src/domain/authService');
const GuestService = require('../src/domain/guestService');
const SafeRender = require('../src/security/safeRender');
const VulnerableRender = require('../src/security/vulnerableRender');

describe('Vivere Guest Management - Core Logic', () => {
    beforeEach(() => {
        // Setup mock local storage standar untuk environment Node
        let store = {};
        global.localStorage = {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
            clear: jest.fn(() => { store = {}; })
        };
        global.localStorage.clear();
    });

    test('should return empty array initially', () => {
        expect(getGuests()).toEqual([]);
    });

    test('should add a valid guest successfully', () => {
        const result = addGuest('John Doe');
        expect(result).toBe(true);
        
        const guests = getGuests();
        expect(guests.length).toBe(1);
        expect(guests[0].name).toBe('John Doe');
        expect(guests[0]).toHaveProperty('id');
    });

    test('should not add empty guest name', () => {
        const result = addGuest('   ');
        expect(result).toBe(false);
        expect(getGuests().length).toBe(0);
    });

    test('should delete a guest by id', () => {
        addGuest('Jane Doe');
        let guests = getGuests();
        const guestId = guests[0].id;
        
        deleteGuest(guestId);
        
        guests = getGuests();
        expect(guests.length).toBe(0);
    });
});

describe('Mini Guest Reception App - Operational Demo Flows', () => {
    beforeEach(() => {
        let store = {};
        global.localStorage = {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
            removeItem: jest.fn(key => { delete store[key]; }),
            clear: jest.fn(() => { store = {}; })
        };
        global.localStorage.clear();
        StorageLayer.resetDemoData();
        StorageLayer.clearSession();
        StorageLayer.setAppMode(StorageLayer.Modes.normal);
    });

    test('login as receptionist', () => {
        const result = AuthService.login('receptionist01', 'password123');

        expect(result.ok).toBe(true);
        expect(result.session.role).toBe('receptionist');
        expect(StorageLayer.getSession().username).toBe('receptionist01');
    });

    test('login as admin', () => {
        const result = AuthService.login('admin01', 'admin123');

        expect(result.ok).toBe(true);
        expect(result.session.role).toBe('admin');
    });

    test('create guest', () => {
        AuthService.login('receptionist01', 'password123');

        const result = GuestService.createGuest({
            name: 'Rina Mahendra',
            room: '1408',
            checkInDate: '2026-06-12',
            checkOutDate: '2026-06-15',
            status: 'Reserved',
            flagType: 'None',
            notes: 'Needs invoice under company name.'
        });

        expect(result.ok).toBe(true);
        expect(result.guest.id).toBe('GST-0008');
        expect(GuestService.getGuestById('GST-0008').name).toBe('Rina Mahendra');
    });

    test('reject invalid guest', () => {
        AuthService.login('receptionist01', 'password123');

        const result = GuestService.createGuest({
            name: '',
            room: '',
            checkInDate: '2026-06-15',
            checkOutDate: '2026-06-10',
            status: 'Reserved',
            flagType: 'None'
        });

        expect(result.ok).toBe(false);
        expect(result.errors).toEqual(expect.arrayContaining([
            'Name is required.',
            'Room is required.',
            'Check-out date cannot be before check-in date.'
        ]));
    });

    test('check-in and check-out guest', () => {
        AuthService.login('receptionist01', 'password123');

        const checkIn = GuestService.checkInGuest('GST-0001');
        expect(checkIn.ok).toBe(true);
        expect(checkIn.guest.status).toBe('Checked In');

        const checkOut = GuestService.checkOutGuest('GST-0001');
        expect(checkOut.ok).toBe(true);
        expect(checkOut.guest.status).toBe('Checked Out');
    });

    test('add note', () => {
        AuthService.login('receptionist01', 'password123');

        const result = GuestService.updateNote('GST-0002', '<img src=x onerror=alert(1)>');

        expect(result.ok).toBe(true);
        expect(GuestService.getGuestById('GST-0002').notes).toContain('onerror');
    });

    test('admin can delete and archive', () => {
        AuthService.login('admin01', 'admin123');

        const archive = GuestService.archiveGuest('GST-0004');
        expect(archive.ok).toBe(true);
        expect(archive.guest.status).toBe('Archived');

        const remove = GuestService.deleteGuest('GST-0005');
        expect(remove.ok).toBe(true);
        expect(GuestService.getGuestById('GST-0005')).toBeNull();
    });

    test('receptionist gets unauthorized for admin-only action', () => {
        AuthService.login('receptionist01', 'password123');

        const result = GuestService.archiveGuest('GST-0004');

        expect(result.ok).toBe(false);
        expect(result.message).toBe('Unauthorized: admin role required.');
    });

    test('reset demo data restores seed', () => {
        AuthService.login('admin01', 'admin123');
        GuestService.deleteGuest('GST-0005');

        const result = GuestService.resetDemoData();

        expect(result.ok).toBe(true);
        expect(StorageLayer.getGuests()).toHaveLength(7);
        expect(GuestService.getGuestById('GST-0005').name).toBe('Sofia Tan');
    });

    test('training mode unsafe rendering function exists separately from safe rendering', () => {
        const payload = '<img src=x onerror=alert(1)>';

        expect(VulnerableRender.noteHtml(payload)).toBe(payload);
        expect(SafeRender.escapeHtml(payload)).toBe('&lt;img src=x onerror=alert(1)&gt;');
    });
});
