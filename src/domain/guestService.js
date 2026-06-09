(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(
            require('../data/storage'),
            require('../data/audit'),
            require('./validation'),
            require('./authService')
        );
    } else {
        root.GuestService = factory(root.StorageLayer, root.AuditService, root.Validation, root.AuthService);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (StorageLayer, AuditService, Validation, AuthService) {
    function nowIso() {
        return new Date().toISOString();
    }

    function getSessionActor() {
        const session = AuthService.getCurrentSession() || {};
        return session.username || 'anonymous';
    }

    function nextGuestId(guests) {
        const max = guests.reduce(function (currentMax, guest) {
            const value = Number(String(guest.id || '').replace('GST-', ''));
            return Number.isFinite(value) ? Math.max(currentMax, value) : currentMax;
        }, 0);
        return 'GST-' + String(max + 1).padStart(4, '0');
    }

    function listGuests(query) {
        query = query || {};
        let guests = StorageLayer.getGuests().filter(function (guest) {
            return guest.status !== 'Archived' || query.includeArchived;
        });

        if (query.search) {
            const needle = String(query.search).toLowerCase();
            guests = guests.filter(function (guest) {
                return String(guest.name).toLowerCase().indexOf(needle) !== -1 ||
                    String(guest.room).toLowerCase().indexOf(needle) !== -1 ||
                    String(guest.id).toLowerCase().indexOf(needle) !== -1;
            });
        }

        if (query.status && query.status !== 'All') {
            guests = guests.filter(function (guest) {
                return guest.status === query.status;
            });
        }

        if (query.flagType && query.flagType !== 'All') {
            guests = guests.filter(function (guest) {
                return guest.flagType === query.flagType;
            });
        }

        const sortBy = query.sortBy || 'checkInDate';
        guests.sort(function (a, b) {
            return String(a[sortBy] || '').localeCompare(String(b[sortBy] || ''));
        });

        return guests;
    }

    function getGuestById(id) {
        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // direct client-side lookup by guest ID simulates an IDOR-style training scenario.
        return StorageLayer.getGuests().find(function (guest) {
            return guest.id == id;
        }) || null;
    }

    function dashboardStats() {
        const guests = StorageLayer.getGuests();
        return {
            total: guests.filter(function (guest) { return guest.status !== 'Archived'; }).length,
            reserved: guests.filter(function (guest) { return guest.status === 'Reserved'; }).length,
            checkedIn: guests.filter(function (guest) { return guest.status === 'Checked In'; }).length,
            checkedOut: guests.filter(function (guest) { return guest.status === 'Checked Out'; }).length,
            flagged: guests.filter(function (guest) { return guest.status === 'Flagged'; }).length
        };
    }

    function createGuest(input, mode) {
        const validation = Validation.validateGuestInput(input, mode || StorageLayer.getAppMode());
        if (!validation.valid) {
            return { ok: false, errors: validation.errors };
        }

        const guests = StorageLayer.getGuests();
        const timestamp = nowIso();
        const guest = {
            id: nextGuestId(guests),
            name: input.name,
            room: input.room,
            checkInDate: input.checkInDate,
            checkOutDate: input.checkOutDate || input.checkInDate,
            status: input.status || 'Reserved',
            notes: input.notes || '',
            flagType: input.flagType || 'None',
            createdBy: getSessionActor(),
            createdAt: timestamp,
            updatedAt: timestamp
        };

        guests.push(guest);
        StorageLayer.saveGuests(guests);
        AuditService.writeAudit(AuditService.AuditActions.CREATE_GUEST, guest.id, 'Created guest ' + guest.name + '.');
        return { ok: true, guest };
    }

    function updateGuest(id, patch, auditAction, detail) {
        const guests = StorageLayer.getGuests();
        const index = guests.findIndex(function (guest) {
            return guest.id == id;
        });

        if (index === -1) {
            return { ok: false, message: 'Guest not found.' };
        }

        const updatedGuest = Object.assign({}, guests[index], patch, { updatedAt: nowIso() });
        guests[index] = updatedGuest;
        StorageLayer.saveGuests(guests);
        AuditService.writeAudit(auditAction || AuditService.AuditActions.UPDATE_GUEST, id, detail || 'Updated guest record.');
        return { ok: true, guest: updatedGuest };
    }

    function checkInGuest(id) {
        const guest = getGuestById(id);
        if (!guest || guest.status !== 'Reserved') {
            return { ok: false, message: 'Only reserved guests can be checked in.' };
        }
        return updateGuest(id, { status: 'Checked In' }, AuditService.AuditActions.CHECK_IN, 'Guest checked in.');
    }

    function checkOutGuest(id) {
        const guest = getGuestById(id);
        if (!guest || guest.status !== 'Checked In') {
            return { ok: false, message: 'Only checked-in guests can be checked out.' };
        }
        return updateGuest(id, { status: 'Checked Out' }, AuditService.AuditActions.CHECK_OUT, 'Guest checked out.');
    }

    function cancelGuest(id) {
        const guest = getGuestById(id);
        if (!guest || guest.status !== 'Reserved') {
            return { ok: false, message: 'Only reserved guests can be cancelled.' };
        }
        return updateGuest(id, { status: 'Cancelled' }, AuditService.AuditActions.CANCEL_GUEST, 'Reservation cancelled.');
    }

    function flagGuest(id, flagType) {
        const guest = getGuestById(id);
        if (!guest || guest.status !== 'Checked In') {
            return { ok: false, message: 'Only checked-in guests can be flagged.' };
        }
        const effectiveFlagType = flagType && flagType !== 'None' ? flagType : 'Special Request';
        return updateGuest(id, {
            status: 'Flagged',
            flagType: effectiveFlagType
        }, AuditService.AuditActions.FLAG_GUEST, 'Guest flagged.');
    }

    function resolveFlag(id) {
        const guest = getGuestById(id);
        if (!guest || guest.status !== 'Flagged') {
            return { ok: false, message: 'Only flagged guests can be resolved.' };
        }
        return updateGuest(id, {
            status: 'Checked In',
            flagType: 'None'
        }, AuditService.AuditActions.RESOLVE_FLAG, 'Guest flag resolved.');
    }

    function updateNote(id, notes) {
        return updateGuest(id, { notes: notes }, AuditService.AuditActions.UPDATE_GUEST, 'Guest note updated.');
    }

    function archiveGuest(id) {
        const adminCheck = AuthService.requireAdmin('ARCHIVE_GUEST', id);
        if (!adminCheck.ok) {
            return adminCheck;
        }

        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // UI hides this from receptionists, but controller/service logic only trusts mutable localStorage role.
        return updateGuest(id, { status: 'Archived' }, AuditService.AuditActions.ARCHIVE_GUEST, 'Guest archived.');
    }

    function deleteGuest(id) {
        const adminCheck = AuthService.requireAdmin('DELETE_GUEST', id);
        if (!adminCheck.ok) {
            return adminCheck;
        }

        const guests = StorageLayer.getGuests();
        const remaining = guests.filter(function (guest) {
            return guest.id != id;
        });
        StorageLayer.saveGuests(remaining);
        AuditService.writeAudit(AuditService.AuditActions.DELETE_GUEST, id, 'Guest deleted from localStorage dataset.');
        return { ok: true };
    }

    function resetDemoData() {
        const adminCheck = AuthService.requireAdmin('RESET_DEMO_DATA', null);
        if (!adminCheck.ok) {
            return adminCheck;
        }

        const result = StorageLayer.resetDemoData();
        AuditService.writeAudit(AuditService.AuditActions.RESET_DEMO_DATA, null, 'Demo data restored to seed state.');
        return { ok: true, guests: result.guests };
    }

    return {
        listGuests,
        getGuestById,
        dashboardStats,
        createGuest,
        updateGuest,
        checkInGuest,
        checkOutGuest,
        cancelGuest,
        flagGuest,
        resolveFlag,
        updateNote,
        archiveGuest,
        deleteGuest,
        resetDemoData,
        nextGuestId
    };
}));
