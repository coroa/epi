App.ApplicationRoute = Ember.Route.extend({
    // admittedly, this should be in IndexRoute and not in the
    // top level ApplicationRoute; we're in transition... :-)
    // model: function () {
    //     return ['red', 'yellow', 'blue'];
    // }
    setupController: function(controller, model) {
        // this.controllerFor('requirements').set('model',
        //                                        this.store.find('requirement'));
        this.controllerFor('vaccines').set('model', this.store.find('vaccine'));
        this._super.apply(this, arguments);
    }
});
