(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('../data/storage'), require('../data/audit'), require('../domain/authService'));
    } else {
        root.AuditController = factory(root.StorageLayer, root.AuditService, root.AuthService);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (StorageLayer, AuditService, AuthService) {
    function bind(rootElement, uiState, rerender) {
        const toggleModeBtn = rootElement.querySelector('#toggleModeBtn');
        if (toggleModeBtn) {
            toggleModeBtn.addEventListener('click', function () {
                const currentMode = StorageLayer.getAppMode();
                const nextMode = currentMode === StorageLayer.Modes.training ? StorageLayer.Modes.normal : StorageLayer.Modes.training;
                StorageLayer.setAppMode(nextMode);
                AuditService.writeAudit(AuditService.AuditActions.MODE_CHANGED, null, 'Mode changed to ' + nextMode + '.');
                rerender();
            });
        }

        const auditToggleBtn = rootElement.querySelector('#auditToggleBtn');
        if (auditToggleBtn) {
            auditToggleBtn.addEventListener('click', function () {
                uiState.showAudit = !uiState.showAudit;
                rerender();
            });
        }

        const modeIndicator = rootElement.querySelector('#modeIndicator');
        if (modeIndicator && (!AuthService.getCurrentSession() || AuthService.getCurrentSession().role !== 'admin')) {
            modeIndicator.title = 'Only admin UI exposes the mode toggle. Session role is still localStorage-tamperable by design.';
        }
    }

    return {
        bind
    };
}));
