(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.SafeRender = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderNote(element, notes) {
        element.textContent = notes || 'No notes yet.';
    }

    return {
        escapeHtml,
        renderNote
    };
}));
