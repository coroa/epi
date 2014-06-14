App.Step2Route = Ember.Route.extend({
    model: null,
    setupController: function(controller, model) {
        var requirements = this.controllerFor('requirements');
        requirements.set('model', this.store.find('requirement'));
        this.controllerFor('vaccines').set('model',
                                           this.store.find('vaccine'));
        this.controllerFor('levels').set('model',
                                         this.store.find('level'));
        this._super.apply(this, arguments);
    }
});
