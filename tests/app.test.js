const { getGuests, addGuest, deleteGuest, StorageKey } = require('../src/app');

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