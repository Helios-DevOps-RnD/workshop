(function (root) {
    const uiState = {
        filters: {
            search: '',
            status: 'All',
            flagType: 'All',
            sortBy: 'checkInDate'
        },
        selectedGuestId: null,
        showCreate: false,
        showAudit: false
    };

    function start() {
        const rootElement = document.getElementById('app');
        const messageElement = document.getElementById('appMessage');

        function rerender(loginMessage) {
            const session = root.AuthService.getCurrentSession();
            if (!session) {
                root.Render.renderLogin(rootElement, loginMessage);
            } else {
                root.Render.renderShell(rootElement, session, uiState);
            }

            root.AuthController.bind(rootElement, rerender);
            root.GuestController.bind(rootElement, uiState, rerender);
            root.AuditController.bind(rootElement, uiState, rerender);

            if (messageElement) {
                messageElement.textContent = '';
            }
        }

        root.StorageLayer.getGuests();
        root.StorageLayer.getAuditLogs();
        root.StorageLayer.setAppMode(root.StorageLayer.getAppMode());
        rerender();
    }

    root.ReceptionApp = {
        start,
        uiState
    };

    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', start);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this));
