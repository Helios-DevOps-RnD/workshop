(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('../security/safeRender'));
    } else {
        root.Templates = factory(root.SafeRender);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (SafeRender) {
    function option(value, label, selectedValue) {
        const selected = value === selectedValue ? ' selected' : '';
        return '<option value="' + SafeRender.escapeHtml(value) + '"' + selected + '>' + SafeRender.escapeHtml(label || value) + '</option>';
    }

    function statusBadge(status) {
        const className = 'status-badge status-' + String(status || '').toLowerCase().replace(/\s+/g, '-');
        return '<span class="' + className + '">' + SafeRender.escapeHtml(status) + '</span>';
    }

    function flagBadge(flagType) {
        if (!flagType || flagType === 'None') {
            return '<span class="flag-badge muted">None</span>';
        }
        return '<span class="flag-badge">' + SafeRender.escapeHtml(flagType) + '</span>';
    }

    function dashboardCard(label, value, tone) {
        return '<article class="metric-card ' + tone + '">' +
            '<span>' + SafeRender.escapeHtml(label) + '</span>' +
            '<strong>' + SafeRender.escapeHtml(value) + '</strong>' +
            '</article>';
    }

    return {
        option,
        statusBadge,
        flagBadge,
        dashboardCard
    };
}));
