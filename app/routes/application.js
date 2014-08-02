import Ember from 'ember';

export default Ember.Route.extend({
    controllerName: 'requirement-sets',
    setupController: function() {
        // this.controllerFor('requirements').set('model',
        //                                        this.store.find('requirement'));
        console.log('setup application controller');
        this._super.apply(this, arguments);

        this.controllerFor('levels')
            .set('model', this.store.find('level'));
        this.controllerFor('vaccines')
            .set('model', this.store.find('vaccine'));
        // this.controllerFor('requirement-sets')
        //     .set('model', this.store.find('requirement-set'));

        // this.store.find('facility');
    },
    model: function() {
        return this.store.find('requirement-set');
    },

    actions: {
        updateRequirementSet: function(id) {
            this.transitionTo('requirement-set.index', id);
        }
    }
});
