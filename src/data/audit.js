(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('./storage'));
    } else {
        root.AuditService = factory(root.StorageLayer);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (StorageLayer) {
    const AuditActions = {
        LOGIN_SUCCESS: 'LOGIN_SUCCESS',
        LOGIN_FAILED: 'LOGIN_FAILED',
        LOGOUT: 'LOGOUT',
        CREATE_GUEST: 'CREATE_GUEST',
        UPDATE_GUEST: 'UPDATE_GUEST',
        CHECK_IN: 'CHECK_IN',
        CHECK_OUT: 'CHECK_OUT',
        FLAG_GUEST: 'FLAG_GUEST',
        RESOLVE_FLAG: 'RESOLVE_FLAG',
        CANCEL_GUEST: 'CANCEL_GUEST',
        ARCHIVE_GUEST: 'ARCHIVE_GUEST',
        DELETE_GUEST: 'DELETE_GUEST',
        RESET_DEMO_DATA: 'RESET_DEMO_DATA',
        MODE_CHANGED: 'MODE_CHANGED',
        UNAUTHORIZED_ATTEMPT: 'UNAUTHORIZED_ATTEMPT'
    };

    function nextAuditId(logs) {
        const max = logs.reduce(function (currentMax, log) {
            const value = Number(String(log.id || '').replace('AUD-', ''));
            return Number.isFinite(value) ? Math.max(currentMax, value) : currentMax;
        }, 0);
        return 'AUD-' + String(max + 1).padStart(4, '0');
    }

    function writeAudit(action, targetId, detail, actorSession) {
        const logs = StorageLayer.getAuditLogs();
        const session = actorSession || StorageLayer.getSession() || {};
        const entry = {
            id: nextAuditId(logs),
            timestamp: new Date().toISOString(),
            actor: session.username || 'anonymous',
            role: session.role || 'guest',
            action,
            targetId: targetId || null,
            detail: detail || ''
        };
        logs.unshift(entry);
        StorageLayer.saveAuditLogs(logs);
        return entry;
    }

    function getRecentLogs(limit) {
        const logs = StorageLayer.getAuditLogs();
        return logs.slice(0, limit || 6);
    }

    return {
        AuditActions,
        writeAudit,
        getRecentLogs,
        getAuditLogs: StorageLayer.getAuditLogs
    };
}));
