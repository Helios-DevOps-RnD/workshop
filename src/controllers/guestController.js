(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('../domain/guestService'), require('../data/storage'));
    } else {
        root.GuestController = factory(root.GuestService, root.StorageLayer);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (GuestService, StorageLayer) {
    function formToGuest(form) {
        return {
            name: form.elements.name.value,
            room: form.elements.room.value,
            checkInDate: form.elements.checkInDate.value,
            checkOutDate: form.elements.checkOutDate.value,
            status: form.elements.status.value,
            flagType: form.elements.flagType.value,
            notes: form.elements.notes.value
        };
    }

    function showDetailMessage(message) {
        const element = document.getElementById('detailMessage');
        if (element) {
            element.textContent = message || '';
        }
    }

    function bind(rootElement, uiState, rerender) {
        const searchInput = rootElement.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                uiState.filters.search = searchInput.value;
                rerender();
            });
        }

        const statusFilter = rootElement.querySelector('#statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', function () {
                uiState.filters.status = statusFilter.value;
                rerender();
            });
        }

        const flagFilter = rootElement.querySelector('#flagFilter');
        if (flagFilter) {
            flagFilter.addEventListener('change', function () {
                uiState.filters.flagType = flagFilter.value;
                rerender();
            });
        }

        const sortSelect = rootElement.querySelector('#sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                uiState.filters.sortBy = sortSelect.value;
                rerender();
            });
        }

        const newGuestBtn = rootElement.querySelector('#newGuestBtn');
        if (newGuestBtn) {
            newGuestBtn.addEventListener('click', function () {
                uiState.showCreate = true;
                rerender();
            });
        }

        const closeCreateBtn = rootElement.querySelector('#closeCreateBtn');
        if (closeCreateBtn) {
            closeCreateBtn.addEventListener('click', function () {
                uiState.showCreate = false;
                rerender();
            });
        }

        const createGuestForm = rootElement.querySelector('#createGuestForm');
        if (createGuestForm) {
            createGuestForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const result = GuestService.createGuest(formToGuest(createGuestForm), StorageLayer.getAppMode());
                const errorBox = rootElement.querySelector('#createGuestErrors');
                if (!result.ok) {
                    errorBox.textContent = result.errors.join(' ');
                    return;
                }
                uiState.showCreate = false;
                uiState.selectedGuestId = result.guest.id;
                rerender();
            });
        }

        rootElement.querySelectorAll('[data-action="open-guest"]').forEach(function (button) {
            button.addEventListener('click', function () {
                uiState.selectedGuestId = button.getAttribute('data-id');
                rerender();
            });
        });

        const closeDetailBtn = rootElement.querySelector('#closeDetailBtn');
        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', function () {
                uiState.selectedGuestId = null;
                rerender();
            });
        }

        rootElement.querySelectorAll('[data-guest-action]').forEach(function (button) {
            button.addEventListener('click', function () {
                const guestId = uiState.selectedGuestId;
                const action = button.getAttribute('data-guest-action');
                const noteInput = rootElement.querySelector('#detailNoteInput');
                const flagTypeInput = rootElement.querySelector('#detailFlagType');
                let result;

                if (action === 'save-note') {
                    result = GuestService.updateNote(guestId, noteInput.value);
                } else if (action === 'check-in') {
                    result = GuestService.checkInGuest(guestId);
                } else if (action === 'check-out') {
                    result = GuestService.checkOutGuest(guestId);
                } else if (action === 'cancel') {
                    result = GuestService.cancelGuest(guestId);
                } else if (action === 'flag') {
                    result = GuestService.flagGuest(guestId, flagTypeInput.value);
                } else if (action === 'resolve-flag') {
                    result = GuestService.resolveFlag(guestId);
                } else if (action === 'archive') {
                    result = GuestService.archiveGuest(guestId);
                } else if (action === 'delete') {
                    result = GuestService.deleteGuest(guestId);
                    if (result.ok) {
                        uiState.selectedGuestId = null;
                    }
                }

                if (!result || !result.ok) {
                    showDetailMessage((result && result.message) || 'Action failed.');
                    return;
                }
                rerender();
            });
        });

        const resetDemoBtn = rootElement.querySelector('#resetDemoBtn');
        if (resetDemoBtn) {
            resetDemoBtn.addEventListener('click', function () {
                const result = GuestService.resetDemoData();
                if (!result.ok) {
                    alert(result.message);
                    return;
                }
                uiState.selectedGuestId = null;
                uiState.showCreate = false;
                rerender();
            });
        }
    }

    return {
        bind
    };
}));
