(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('./templates'), require('../domain/validation'), require('../security/safeRender'));
    } else {
        root.Components = factory(root.Templates, root.Validation, root.SafeRender);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (Templates, Validation, SafeRender) {
    function loginScreen(message) {
        return '<section class="login-card">' +
            '<div class="brand-mark">V</div>' +
            '<p class="eyebrow">Vivere Hotel Operations</p>' +
            '<h1>Mini Guest Reception App Demo</h1>' +
            '<p class="login-copy">Use the mock users for a controlled security training demo. This is intentionally frontend-only.</p>' +
            (message ? '<div class="alert alert-error">' + SafeRender.escapeHtml(message) + '</div>' : '') +
            '<form id="loginForm" class="stack">' +
            '<label>Username<input id="loginUsername" name="username" autocomplete="username" value="receptionist01"></label>' +
            '<label>Password<input id="loginPassword" name="password" type="password" autocomplete="current-password" value="password123"></label>' +
            '<button class="btn btn-primary" type="submit">Sign In</button>' +
            '</form>' +
            '<div class="demo-users"><strong>Demo users</strong><span>receptionist01 / password123</span><span>admin01 / admin123</span></div>' +
            '</section>';
    }

    function header(session, modeLabel) {
        const isAdmin = session && session.role === 'admin';
        return '<header class="app-header">' +
            '<div><p class="eyebrow">Vivere Hotel</p><h1>Reception Operations</h1></div>' +
            '<div class="header-actions">' +
            '<span class="mode-pill" id="modeIndicator">' + SafeRender.escapeHtml(modeLabel) + '</span>' +
            '<span class="user-pill">' + SafeRender.escapeHtml(session.displayName || session.username) + ' · ' + SafeRender.escapeHtml(session.role) + '</span>' +
            (isAdmin ? '<button id="toggleModeBtn" class="btn btn-secondary" type="button">Toggle Mode</button>' : '') +
            '<button id="logoutBtn" class="btn btn-ghost" type="button">Logout</button>' +
            '</div>' +
            '</header>';
    }

    function dashboard(stats, logs) {
        const logHtml = logs.map(function (log) {
            return '<li><strong>' + SafeRender.escapeHtml(log.action) + '</strong><span>' +
                SafeRender.escapeHtml(log.actor) + ' · ' + SafeRender.escapeHtml(log.targetId || 'system') +
                '</span></li>';
        }).join('');

        return '<section class="dashboard-grid">' +
            Templates.dashboardCard('Total Guests', stats.total, 'tone-total') +
            Templates.dashboardCard('Reserved', stats.reserved, 'tone-reserved') +
            Templates.dashboardCard('Checked In', stats.checkedIn, 'tone-in') +
            Templates.dashboardCard('Checked Out', stats.checkedOut, 'tone-out') +
            Templates.dashboardCard('Flagged', stats.flagged, 'tone-flagged') +
            '<article class="activity-card"><h2>Recent Activity</h2><ul>' + (logHtml || '<li>No activity yet.</li>') + '</ul></article>' +
            '</section>';
    }

    function guestFilters(state) {
        const statusOptions = ['All'].concat(Validation.VALID_STATUSES).map(function (status) {
            return Templates.option(status, status, state.status);
        }).join('');
        const flagOptions = ['All'].concat(Validation.VALID_FLAG_TYPES).map(function (flagType) {
            return Templates.option(flagType, flagType, state.flagType);
        }).join('');
        const sortOptions = [
            ['name', 'Name'],
            ['room', 'Room'],
            ['checkInDate', 'Check-in Date'],
            ['status', 'Status']
        ].map(function (item) {
            return Templates.option(item[0], item[1], state.sortBy);
        }).join('');

        return '<section class="toolbar">' +
            '<input id="searchInput" placeholder="Search by name, room, or GST ID" value="' + SafeRender.escapeHtml(state.search || '') + '">' +
            '<select id="statusFilter">' + statusOptions + '</select>' +
            '<select id="flagFilter">' + flagOptions + '</select>' +
            '<select id="sortSelect">' + sortOptions + '</select>' +
            '<button id="newGuestBtn" class="btn btn-primary" type="button">Create Guest</button>' +
            '</section>';
    }

    function guestTable(guests) {
        const rows = guests.map(function (guest) {
            return '<tr data-guest-id="' + SafeRender.escapeHtml(guest.id) + '">' +
                '<td><button class="link-button guest-open" data-action="open-guest" data-id="' + SafeRender.escapeHtml(guest.id) + '">' + SafeRender.escapeHtml(guest.id) + '</button></td>' +
                '<td>' + SafeRender.escapeHtml(guest.name) + '</td>' +
                '<td>' + SafeRender.escapeHtml(guest.room) + '</td>' +
                '<td>' + SafeRender.escapeHtml(guest.checkInDate) + '</td>' +
                '<td>' + Templates.statusBadge(guest.status) + '</td>' +
                '<td>' + Templates.flagBadge(guest.flagType) + '</td>' +
                '</tr>';
        }).join('');

        return '<section class="panel"><div class="panel-heading"><h2>Guest Management</h2><p>' + guests.length + ' visible records</p></div>' +
            '<div class="table-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>Room</th><th>Check-in</th><th>Status</th><th>Flag</th></tr></thead>' +
            '<tbody>' + (rows || '<tr><td colspan="6" class="empty-state">No guests match the current filters.</td></tr>') + '</tbody></table></div></section>';
    }

    function createGuestForm() {
        const statusOptions = ['Reserved', 'Checked In'].map(function (status) {
            return Templates.option(status, status, 'Reserved');
        }).join('');
        const flagOptions = Validation.VALID_FLAG_TYPES.map(function (flagType) {
            return Templates.option(flagType, flagType, 'None');
        }).join('');

        return '<section class="panel form-panel">' +
            '<div class="panel-heading"><h2>Create Guest</h2><button id="closeCreateBtn" class="btn btn-ghost" type="button">Close</button></div>' +
            '<form id="createGuestForm" class="guest-form">' +
            '<label>Name<input name="name" required></label>' +
            '<label>Room<input name="room" required></label>' +
            '<label>Check-in Date<input name="checkInDate" type="date" required></label>' +
            '<label>Check-out Date<input name="checkOutDate" type="date"></label>' +
            '<label>Status<select name="status">' + statusOptions + '</select></label>' +
            '<label>Flag Type<select name="flagType">' + flagOptions + '</select></label>' +
            '<label class="wide">Notes<textarea name="notes" rows="4" placeholder="Operational notes"></textarea></label>' +
            '<button class="btn btn-primary" type="submit">Save Guest</button>' +
            '</form>' +
            '<div id="createGuestErrors" class="form-errors"></div>' +
            '</section>';
    }

    function auditPanel(logs) {
        const rows = logs.map(function (log) {
            return '<tr><td>' + SafeRender.escapeHtml(log.timestamp) + '</td><td>' + SafeRender.escapeHtml(log.actor) + '</td><td>' +
                SafeRender.escapeHtml(log.role) + '</td><td>' + SafeRender.escapeHtml(log.action) + '</td><td>' +
                SafeRender.escapeHtml(log.targetId || '-') + '</td><td>' + SafeRender.escapeHtml(log.detail) + '</td></tr>';
        }).join('');

        return '<section class="panel audit-panel"><div class="panel-heading"><h2>Audit Log</h2><p>localStorage-backed and editable for demo</p></div>' +
            '<div class="table-wrap"><table><thead><tr><th>Timestamp</th><th>Actor</th><th>Role</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table></div></section>';
    }

    return {
        loginScreen,
        header,
        dashboard,
        guestFilters,
        guestTable,
        createGuestForm,
        auditPanel
    };
}));
