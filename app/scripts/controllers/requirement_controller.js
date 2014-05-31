var make_isXCustom_func = function(X) {
    return function() {
        return this.get(X) != this.get('vaccine.' + X);
    }.property(X, 'vaccine.' + X);
};

App.RequirementController = Ember.ObjectController.extend({
    isVaccineVolumeCustom: make_isXCustom_func('vaccine_volume'),
    isDiluentVolumeCustom: make_isXCustom_func('diluent_volume'),
    isDosesSeriesCustom: make_isXCustom_func('doses_series'),
    isWastageRateCustom: make_isXCustom_func('wastage_rate')
});
