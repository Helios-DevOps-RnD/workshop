(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.Validation = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const VALID_STATUSES = ['Reserved', 'Checked In', 'Checked Out', 'Flagged', 'Cancelled', 'Archived'];
    const VALID_FLAG_TYPES = ['VIP', 'Payment Issue', 'Special Request', 'None'];

    function isValidStatus(status) {
        return VALID_STATUSES.indexOf(status) !== -1;
    }

    function isValidFlagType(flagType) {
        return VALID_FLAG_TYPES.indexOf(flagType) !== -1;
    }

    function validateGuestInput(input, mode) {
        const errors = [];
        const isTrainingMode = mode === 'training';

        if (!input.name || !String(input.name).trim()) {
            errors.push('Name is required.');
        }

        if (!input.room || !String(input.room).trim()) {
            errors.push('Room is required.');
        }

        if (!input.checkInDate) {
            errors.push('Check-in date is required.');
        }

        if (input.checkInDate && input.checkOutDate && input.checkOutDate < input.checkInDate) {
            errors.push('Check-out date cannot be before check-in date.');
        }

        if (input.status && !isValidStatus(input.status)) {
            errors.push('Status is invalid.');
        }

        // INTENTIONAL VULNERABILITY FOR DEMO PURPOSES:
        // Security Training Mode weakens selected validation to make malicious note/flag scenarios easier to demo.
        if (!isTrainingMode && input.flagType && !isValidFlagType(input.flagType)) {
            errors.push('Flag type is invalid.');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    return {
        VALID_STATUSES,
        VALID_FLAG_TYPES,
        isValidStatus,
        isValidFlagType,
        validateGuestInput
    };
}));
