import Ember from 'ember';

export default Ember.Route.extend({
    setupController: function() {
        // this.controllerFor('requirements').set('model',
        //                                        this.store.find('requirement'));
        console.log('setup application controller');
        this.controllerFor('requirements').set('model', this.store.find('requirement'));
        this.controllerFor('vaccines').set('model',
                                           this.store.find('vaccine'));
        this.controllerFor('levelParamsets').set('model', this.store.find('levelParamset'));
        this.controllerFor('levels').set('model',
                                         this.store.find('level'));

        this._super.apply(this, arguments);
        // this.store.createRecord('vaccine', {'product': 'help',
        //                                     'presentation':
        //                                     'bar'}).save()
        //     .then(function(record) {
        //         debugger;
        //     });
    }
});
