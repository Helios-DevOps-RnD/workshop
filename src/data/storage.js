(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('./seed'));
    } else {
        root.StorageLayer = factory(root.SeedData);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (SeedData) {
    const StorageKeys = {
        guests: 'vivere_guests_v2',
        legacyGuests: 'vivere_guests_v1',
        auditLogs: 'vivere_audit_logs_v1',
        session: 'vivere_session_v1',
        mode: 'vivere_app_mode_v1'
    };

    const Modes = {
        normal: 'normal',
        training: 'training'
    };

    function hasStorage() {
        return typeof localStorage !== 'undefined';
    }

    function readJson(key, fallback) {
        if (!hasStorage()) {
            return fallback;
        }

        const data = localStorage.getItem(key);
        if (!data) {
            return fallback;
        }

        try {
            return JSON.parse(data);
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        if (!hasStorage()) {
            return;
        }

        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // guest data, session data, audit logs, and mode are persisted in localStorage
        // so presenters can demonstrate client-side sensitive data exposure and tampering.
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getAppMode() {
        const mode = hasStorage() ? localStorage.getItem(StorageKeys.mode) : null;
        return mode === Modes.training ? Modes.training : Modes.normal;
    }

    function setAppMode(mode) {
        const normalizedMode = mode === Modes.training ? Modes.training : Modes.normal;
        if (hasStorage()) {
            localStorage.setItem(StorageKeys.mode, normalizedMode);
        }
        return normalizedMode;
    }

    function normalizeGuest(rawGuest, index, actor) {
        if (typeof rawGuest === 'string') {
            rawGuest = { name: rawGuest };
        }

        const sequence = index + 1;
        const now = new Date().toISOString();
        return {
            id: rawGuest.id && /^GST-/.test(String(rawGuest.id)) ? String(rawGuest.id) : 'GST-' + String(sequence).padStart(4, '0'),
            name: rawGuest.name || 'Legacy Guest ' + sequence,
            room: rawGuest.room || 'TBD',
            checkInDate: rawGuest.checkInDate || new Date().toISOString().slice(0, 10),
            checkOutDate: rawGuest.checkOutDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            status: rawGuest.status || 'Reserved',
            notes: rawGuest.notes || '',
            flagType: rawGuest.flagType || 'None',
            createdBy: rawGuest.createdBy || actor || 'legacy-migration',
            createdAt: rawGuest.createdAt || now,
            updatedAt: rawGuest.updatedAt || now
        };
    }

    function migrateLegacyGuestsIfNeeded() {
        const currentGuests = readJson(StorageKeys.guests, null);
        if (Array.isArray(currentGuests)) {
            return currentGuests.map(normalizeGuest);
        }

        const legacyGuests = readJson(StorageKeys.legacyGuests, null);
        if (Array.isArray(legacyGuests) && legacyGuests.length > 0) {
            const migrated = legacyGuests.map(function (guest, index) {
                return normalizeGuest(guest, index, 'legacy-migration');
            });
            writeJson(StorageKeys.guests, migrated);
            return migrated;
        }

        const seeded = SeedData.getSeedGuests();
        writeJson(StorageKeys.guests, seeded);
        return seeded;
    }

    function getGuests() {
        return migrateLegacyGuestsIfNeeded();
    }

    function saveGuests(guests) {
        writeJson(StorageKeys.guests, guests);
        return guests;
    }

    function getAuditLogs() {
        const logs = readJson(StorageKeys.auditLogs, null);
        if (Array.isArray(logs)) {
            return logs;
        }

        const seeded = SeedData.getSeedAuditLogs();
        writeJson(StorageKeys.auditLogs, seeded);
        return seeded;
    }

    function saveAuditLogs(logs) {
        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // audit logs are editable by anyone with devtools because this is a frontend-only demo.
        writeJson(StorageKeys.auditLogs, logs);
        return logs;
    }

    function getSession() {
        return readJson(StorageKeys.session, null);
    }

    function saveSession(session) {
        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // mock session and role are stored in localStorage to demonstrate privilege escalation by editing role.
        writeJson(StorageKeys.session, session);
        return session;
    }

    function clearSession() {
        if (hasStorage()) {
            localStorage.removeItem(StorageKeys.session);
        }
    }

    function resetDemoData() {
        const guests = SeedData.getSeedGuests();
        const logs = SeedData.getSeedAuditLogs();
        saveGuests(guests);
        saveAuditLogs(logs);
        return { guests, logs };
    }

    return {
        StorageKeys,
        Modes,
        getAppMode,
        setAppMode,
        getGuests,
        saveGuests,
        getAuditLogs,
        saveAuditLogs,
        getSession,
        saveSession,
        clearSession,
        resetDemoData,
        normalizeGuest,
        readJson,
        writeJson
    };
}));
