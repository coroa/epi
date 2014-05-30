App.RequirementsRoute = Ember.Route.extend({
    model: function(params) {
        return this.store.find('requirement');
    }
});
