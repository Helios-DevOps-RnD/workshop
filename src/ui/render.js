(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(
            require('./components'),
            require('./templates'),
            require('../security/safeRender'),
            require('../security/vulnerableRender'),
            require('../data/storage'),
            require('../data/audit'),
            require('../domain/guestService'),
            require('../security/trainingMode')
        );
    } else {
        root.Render = factory(
            root.Components,
            root.Templates,
            root.SafeRender,
            root.VulnerableRender,
            root.StorageLayer,
            root.AuditService,
            root.GuestService,
            root.TrainingMode
        );
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (Components, Templates, SafeRender, VulnerableRender, StorageLayer, AuditService, GuestService, TrainingMode) {
    function renderLogin(rootElement, message) {
        rootElement.innerHTML = Components.loginScreen(message);
    }

    function renderShell(rootElement, session, uiState) {
        const stats = GuestService.dashboardStats();
        const guests = GuestService.listGuests(uiState.filters);
        const isAdmin = session.role === 'admin';
        const auditHtml = isAdmin && uiState.showAudit ? Components.auditPanel(AuditService.getAuditLogs()) : '';
        const resetHtml = isAdmin ? '<button id="resetDemoBtn" class="btn btn-danger" type="button">Reset Demo Data</button>' : '';
        const trainingNote = TrainingMode.isTrainingMode()
            ? '<div class="alert alert-warning">Security Training Mode: guest notes render with unsafe HTML for stored XSS demonstration.</div>'
            : '';

        rootElement.innerHTML =
            Components.header(session, TrainingMode.label()) +
            '<main class="app-layout">' +
            '<div class="admin-row">' +
            (isAdmin ? '<button id="auditToggleBtn" class="btn btn-secondary" type="button">' + (uiState.showAudit ? 'Hide Audit Log' : 'View Audit Log') + '</button>' : '') +
            resetHtml +
            '</div>' +
            trainingNote +
            Components.dashboard(stats, AuditService.getRecentLogs(5)) +
            Components.guestFilters(uiState.filters) +
            Components.guestTable(guests) +
            (uiState.showCreate ? Components.createGuestForm() : '') +
            auditHtml +
            '<aside id="detailDrawer" class="detail-drawer' + (uiState.selectedGuestId ? ' open' : '') + '"></aside>' +
            '</main>';

        if (uiState.selectedGuestId) {
            renderGuestDetail(uiState.selectedGuestId, session);
        }
    }

    function detailActions(guest, isAdmin) {
        const actions = [];
        if (guest.status === 'Reserved') {
            actions.push('<button class="btn btn-primary" data-guest-action="check-in">Check In</button>');
            actions.push('<button class="btn btn-secondary" data-guest-action="cancel">Cancel</button>');
        }
        if (guest.status === 'Checked In') {
            actions.push('<button class="btn btn-primary" data-guest-action="check-out">Check Out</button>');
            actions.push('<button class="btn btn-warning" data-guest-action="flag">Flag Guest</button>');
        }
        if (guest.status === 'Flagged') {
            actions.push('<button class="btn btn-primary" data-guest-action="resolve-flag">Resolve Flag</button>');
        }
        if (isAdmin) {
            actions.push('<button class="btn btn-secondary" data-guest-action="archive">Archive</button>');
            actions.push('<button class="btn btn-danger" data-guest-action="delete">Delete</button>');
        }
        return actions.join('');
    }

    function renderGuestDetail(guestId, session) {
        const drawer = document.getElementById('detailDrawer');
        if (!drawer) {
            return;
        }

        const guest = GuestService.getGuestById(guestId);
        if (!guest) {
            drawer.className = 'detail-drawer open';
            drawer.innerHTML = '<div class="drawer-card"><button id="closeDetailBtn" class="drawer-close">×</button><p>Guest not found.</p></div>';
            return;
        }

        const isAdmin = session && session.role === 'admin';
        drawer.className = 'detail-drawer open';
        drawer.innerHTML = '<div class="drawer-card">' +
            '<button id="closeDetailBtn" class="drawer-close" type="button">×</button>' +
            '<p class="eyebrow">' + SafeRender.escapeHtml(guest.id) + '</p>' +
            '<h2>' + SafeRender.escapeHtml(guest.name) + '</h2>' +
            '<div class="detail-meta">' +
            '<span>Room <strong>' + SafeRender.escapeHtml(guest.room) + '</strong></span>' +
            '<span>' + Templates.statusBadge(guest.status) + '</span>' +
            '<span>' + Templates.flagBadge(guest.flagType) + '</span>' +
            '</div>' +
            '<dl class="detail-list">' +
            '<dt>Check-in</dt><dd>' + SafeRender.escapeHtml(guest.checkInDate) + '</dd>' +
            '<dt>Check-out</dt><dd>' + SafeRender.escapeHtml(guest.checkOutDate) + '</dd>' +
            '<dt>Created By</dt><dd>' + SafeRender.escapeHtml(guest.createdBy) + '</dd>' +
            '<dt>Created At</dt><dd>' + SafeRender.escapeHtml(guest.createdAt) + '</dd>' +
            '<dt>Updated At</dt><dd>' + SafeRender.escapeHtml(guest.updatedAt) + '</dd>' +
            '</dl>' +
            '<section><h3>Guest Notes</h3><div id="guestNotePreview" class="note-preview"></div></section>' +
            '<label>Update Note<textarea id="detailNoteInput" rows="5"></textarea></label>' +
            '<label>Flag Type<select id="detailFlagType">' +
            ['VIP', 'Payment Issue', 'Special Request', 'None'].map(function (flagType) {
                return Templates.option(flagType, flagType, guest.flagType);
            }).join('') +
            '</select></label>' +
            '<div class="drawer-actions">' +
            '<button class="btn btn-secondary" data-guest-action="save-note">Save Note</button>' +
            detailActions(guest, isAdmin) +
            '</div>' +
            '<div id="detailMessage" class="form-errors"></div>' +
            '</div>';

        document.getElementById('detailNoteInput').value = guest.notes || '';
        const notePreview = document.getElementById('guestNotePreview');
        if (TrainingMode.isTrainingMode()) {
            VulnerableRender.renderNote(notePreview, guest.notes);
        } else {
            SafeRender.renderNote(notePreview, guest.notes);
        }
    }

    function renderMessage(text, type) {
        const element = document.getElementById('appMessage');
        if (!element) {
            return;
        }
        element.className = 'toast ' + (type || '');
        element.textContent = text || '';
    }

    return {
        renderLogin,
        renderShell,
        renderGuestDetail,
        renderMessage
    };
}));
