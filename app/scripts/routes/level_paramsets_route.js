App.LevelParamsetsRoute = Ember.Route.extend({
    model: function (params) {
        return this.store.find('levelParamsets');
    }
});
