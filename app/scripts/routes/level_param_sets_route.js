App.LevelParamSetsRoute = Ember.Route.extend({
    model: function (params) {
        return this.store.find('levelParamSets');
    }
});
