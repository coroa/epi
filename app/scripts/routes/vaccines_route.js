App.VaccinesRoute = Ember.Route.extend({
    model: function(params) {
        return this.store.find('vaccines');
    }
});
