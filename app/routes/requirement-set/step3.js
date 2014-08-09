import Ember from 'ember';

export default Ember.Route.extend({
    setupController: function() {
        this._super();
        this.controllerFor('chart-picker')
            .send('switchToChart', null);
        var facilities = this.controllerFor('facilities');
        if (facilities.get('length') === 0) {
            console.log('loading facilities');
            facilities.set('model', this.store.find('facility', {paging: false}));
        }
    }
    // actions: {
    //     setAffected: function(ps, _, affected) {
    //         this.controllerFor('requirements').setAffectedParamset(ps, affected);
    //     }
    // }
});
