App.Step2Route = Ember.Route.extend({
    setupController: function(controller, model) {
        this.controllerFor('requirements').set('model', this.store.find('requirement'));
        this.controllerFor('vaccines').set('model',
                                           this.store.find('vaccine'));
        this.controllerFor('levelParamsets').set('model', this.store.find('levelParamset'));
        this.controllerFor('levels').set('model', this.store.find('level'));
        this._super.apply(this, arguments);
    }
});
