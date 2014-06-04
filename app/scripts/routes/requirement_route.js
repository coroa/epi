App.RequirementRoute = Ember.Route.extend({
    model: function (params) {
        return this.store.find('requirement', params.requirement_id);
    }
});
