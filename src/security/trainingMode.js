(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('../data/storage'));
    } else {
        root.TrainingMode = factory(root.StorageLayer);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (StorageLayer) {
    function isTrainingMode() {
        return StorageLayer.getAppMode() === StorageLayer.Modes.training;
    }

    function label() {
        return isTrainingMode() ? 'Security Training Mode' : 'Normal Demo Mode';
    }

    return {
        isTrainingMode,
        label
    };
}));
