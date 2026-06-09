(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('../data/storage'), require('../data/audit'));
    } else {
        root.AuthService = factory(root.StorageLayer, root.AuditService);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (StorageLayer, AuditService) {
    const USERS = [
        { username: 'receptionist01', password: 'password123', role: 'receptionist', displayName: 'Receptionist 01' },
        { username: 'admin01', password: 'admin123', role: 'admin', displayName: 'Admin 01' }
    ];

    function login(username, password) {
        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // weak hardcoded credentials and plaintext password comparison are kept for security training.
        const user = USERS.find(function (candidate) {
            return candidate.username == username && candidate.password == password;
        });

        if (!user) {
            AuditService.writeAudit(AuditService.AuditActions.LOGIN_FAILED, null, 'Failed login for username: ' + username, {
                username: username || 'unknown',
                role: 'guest'
            });
            return { ok: false, message: 'Invalid username or password.' };
        }

        const session = {
            username: user.username,
            role: user.role,
            displayName: user.displayName,
            loginAt: new Date().toISOString()
        };
        StorageLayer.saveSession(session);
        AuditService.writeAudit(AuditService.AuditActions.LOGIN_SUCCESS, null, 'Mock login succeeded.', session);
        return { ok: true, session };
    }

    function logout() {
        const session = getCurrentSession();
        AuditService.writeAudit(AuditService.AuditActions.LOGOUT, null, 'User logged out.', session);
        StorageLayer.clearSession();
    }

    function getCurrentSession() {
        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // trust localStorage session data so role tampering can be demonstrated from devtools.
        return StorageLayer.getSession();
    }

    function requireAdmin(actionName, targetId) {
        const session = getCurrentSession() || {};
        if (session.role === 'admin') {
            return { ok: true, session };
        }

        AuditService.writeAudit(
            AuditService.AuditActions.UNAUTHORIZED_ATTEMPT,
            targetId || null,
            'Attempted admin-only action: ' + actionName,
            session
        );

        return {
            ok: false,
            message: 'Unauthorized: admin role required.',
            session
        };
    }

    return {
        USERS,
        login,
        logout,
        getCurrentSession,
        requireAdmin
    };
}));
