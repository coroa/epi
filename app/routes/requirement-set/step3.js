import Ember from 'ember';

export default Ember.Route.extend({
    setupController: function(controller, model) {
        this._super(controller, {});
        this.controllerFor('chart-picker')
            .send('switchToChart', null);
        if (model !== null) {
            this.controllerFor('facilities').set('model', model);
        }
    },
    // actions: {
    //     setAffected: function(ps, _, affected) {
    //         this.controllerFor('requirements').setAffectedParamset(ps, affected);
    //     }
    // }
    model: function() {
        var facilities = this.controllerFor('facilities');
        if (facilities.get('length') === 0) {
            console.log('loading facilities');
            return this.store.find('facility', {paging: false});
        } else {
            return null;
        }
    }
});
