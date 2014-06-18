App.Step1Route = Ember.Route.extend({
    setupController: function(controller, model) {
        this.controllerFor('requirements').set('model', this.store.find('requirement'));
        this.controllerFor('vaccines').set('model',
                                           this.store.find('vaccine'));
        this.controllerFor('chartPicker').send('switchToChart',
                                               App.Enums.charts.VOLPERCOURSE);
        this._super.apply(this, arguments);
    }
});
