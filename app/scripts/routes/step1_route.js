App.Step1Route = Ember.Route.extend({
    model: null,
    setupController: function(controller, model) {
        var requirements = this.controllerFor('requirements');
        requirements.set('model', this.store.find('requirement'));
        this.controllerFor('vaccines').set('model', this.store.find('vaccine'));
        this._super.apply(this, arguments);
    }
});
