(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.VulnerableRender = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function renderNote(element, notes) {
        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // Stored XSS training payload example for notes:
        // <img src=x onerror=alert('guest-note-xss')>
        element.innerHTML = notes || '<em>No notes yet.</em>';
    }

    function noteHtml(notes) {
        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // This helper exists separately so tests can prove unsafe rendering remains isolated.
        return String(notes || '');
    }

    return {
        renderNote,
        noteHtml
    };
}));
