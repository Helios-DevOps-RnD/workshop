(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.SeedData = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const DEMO_GUESTS = [
        {
            id: 'GST-0001',
            name: 'Maya Santoso',
            room: '1201',
            checkInDate: '2026-06-09',
            checkOutDate: '2026-06-12',
            status: 'Reserved',
            notes: 'Prefers quiet floor near elevator access.',
            flagType: 'Special Request',
            createdBy: 'system',
            createdAt: '2026-06-08T08:00:00.000Z',
            updatedAt: '2026-06-08T08:00:00.000Z'
        },
        {
            id: 'GST-0002',
            name: 'Arief Nugroho',
            room: '0907',
            checkInDate: '2026-06-09',
            checkOutDate: '2026-06-10',
            status: 'Checked In',
            notes: 'Corporate booking, breakfast included.',
            flagType: 'None',
            createdBy: 'receptionist01',
            createdAt: '2026-06-09T02:30:00.000Z',
            updatedAt: '2026-06-09T03:00:00.000Z'
        },
        {
            id: 'GST-0003',
            name: 'Clara Wijaya',
            room: '1510',
            checkInDate: '2026-06-08',
            checkOutDate: '2026-06-11',
            status: 'Flagged',
            notes: 'Card authorization pending; contact manager before extending stay.',
            flagType: 'Payment Issue',
            createdBy: 'admin01',
            createdAt: '2026-06-08T04:15:00.000Z',
            updatedAt: '2026-06-09T04:45:00.000Z'
        },
        {
            id: 'GST-0004',
            name: 'Daniel Hartono',
            room: '0802',
            checkInDate: '2026-06-07',
            checkOutDate: '2026-06-09',
            status: 'Checked Out',
            notes: 'Late checkout approved until 14:00.',
            flagType: 'VIP',
            createdBy: 'receptionist01',
            createdAt: '2026-06-07T01:05:00.000Z',
            updatedAt: '2026-06-09T06:20:00.000Z'
        },
        {
            id: 'GST-0005',
            name: 'Sofia Tan',
            room: '1703',
            checkInDate: '2026-06-10',
            checkOutDate: '2026-06-14',
            status: 'Reserved',
            notes: 'Anniversary stay, arrange welcome fruit.',
            flagType: 'VIP',
            createdBy: 'system',
            createdAt: '2026-06-08T10:25:00.000Z',
            updatedAt: '2026-06-08T10:25:00.000Z'
        },
        {
            id: 'GST-0006',
            name: 'Budi Laksana',
            room: '0605',
            checkInDate: '2026-06-09',
            checkOutDate: '2026-06-13',
            status: 'Flagged',
            notes: 'Needs wheelchair access and room service call before arrival.',
            flagType: 'Special Request',
            createdBy: 'receptionist01',
            createdAt: '2026-06-08T12:40:00.000Z',
            updatedAt: '2026-06-09T01:50:00.000Z'
        },
        {
            id: 'GST-0007',
            name: 'Nadia Pratama',
            room: '1104',
            checkInDate: '2026-06-09',
            checkOutDate: '2026-06-12',
            status: 'Checked In',
            notes: 'Airport pickup completed.',
            flagType: 'None',
            createdBy: 'admin01',
            createdAt: '2026-06-09T00:30:00.000Z',
            updatedAt: '2026-06-09T02:05:00.000Z'
        }
    ];

    const DEMO_AUDIT_LOGS = [
        {
            id: 'AUD-0001',
            timestamp: '2026-06-09T01:00:00.000Z',
            actor: 'system',
            role: 'system',
            action: 'RESET_DEMO_DATA',
            targetId: null,
            detail: 'Seeded initial mini reception demo data.'
        },
        {
            id: 'AUD-0002',
            timestamp: '2026-06-09T02:05:00.000Z',
            actor: 'admin01',
            role: 'admin',
            action: 'CHECK_IN',
            targetId: 'GST-0007',
            detail: 'Guest checked in during morning handover.'
        },
        {
            id: 'AUD-0003',
            timestamp: '2026-06-09T04:45:00.000Z',
            actor: 'admin01',
            role: 'admin',
            action: 'FLAG_GUEST',
            targetId: 'GST-0003',
            detail: 'Payment issue flagged for front desk follow-up.'
        }
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getSeedGuests() {
        return clone(DEMO_GUESTS);
    }

    function getSeedAuditLogs() {
        return clone(DEMO_AUDIT_LOGS);
    }

    return {
        getSeedGuests,
        getSeedAuditLogs
    };
}));
