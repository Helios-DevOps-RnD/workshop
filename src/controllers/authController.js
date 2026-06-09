(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('../domain/authService'));
    } else {
        root.AuthController = factory(root.AuthService);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (AuthService) {
    function bind(rootElement, rerender) {
        const loginForm = rootElement.querySelector('#loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const username = rootElement.querySelector('#loginUsername').value;
                const password = rootElement.querySelector('#loginPassword').value;
                const result = AuthService.login(username, password);
                rerender(result.ok ? null : result.message);
            });
        }

        const logoutBtn = rootElement.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                AuthService.logout();
                rerender();
            });
        }
    }

    return {
        bind
    };
}));
