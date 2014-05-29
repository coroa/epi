App.VaccineRoute = Ember.Route.extend({
    // admittedly, this should be in IndexRoute and not in the
    // top level ApplicationRoute; we're in transition... :-)
    model: function (params) {
        return this.store.find('vaccine', params.vaccine_id);
    }
});
