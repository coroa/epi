var make_isXCustom_func = function(X) {
    return function() {
        return this.get(X) != this.get('vaccine.' + X);
    }.property(X, 'vaccine.' + X);
};

App.RequirementController = Ember.ObjectController.extend({
    needs: ['requirements'],
    data: function() {
        var reqs = this.get("controllers.requirements");
        var ret = reqs.map(function(req, index, en) {
            console.log("label: " + req.get("vaccine.name"));
            return { value: req.get("vaccine_schedule_factor"),
                     type: req.get("type"),
                     label: req.get("vaccine.name")};
        });
        console.log(ret);
        return ret;
    }.property('controllers.requirements.@each.vaccine.name',
               'controllers.requirements.@each.vaccine_schedule_factor',
               'controllers.requirements.@each.type'),
    isVaccineVolumeCustom: make_isXCustom_func('vaccine_volume'),
    isDiluentVolumeCustom: make_isXCustom_func('diluent_volume'),
    isDosesSeriesCustom: make_isXCustom_func('doses_series'),
    isWastageRateCustom: make_isXCustom_func('wastage_rate')
});
