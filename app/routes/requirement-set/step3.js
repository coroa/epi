import Ember from 'ember';

export default Ember.Route.extend({
    setupController: function() {
        this._super();
        this.controllerFor('chart-picker')
            .send('switchToChart', null);
    }
    // actions: {
    //     setAffected: function(ps, _, affected) {
    //         this.controllerFor('requirements').setAffectedParamset(ps, affected);
    //     }
    // }
});
