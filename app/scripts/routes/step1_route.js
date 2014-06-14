App.Step1Route = Ember.Route.extend({
    model: null,
    setupController: function(controller, model) {
        var requirements = this.controllerFor('requirements'),
            pending_records = {},
            _ = this;
        requirements.set('model', this.store.find('requirement'));
        // [ 'routine', 'school', 'sia', 'other' ].map(function(service) {
        //     pending_records[ service ] =
        //         _.store.createRecord('requirement', {type:
        //                                                 service});
        // });
        requirements.set('pending_records', pending_records);
        this.controllerFor('vaccines').set('model', this.store.find('vaccine'));
        this._super.apply(this, arguments);
    }

});
