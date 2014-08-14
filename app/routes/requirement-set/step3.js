import Ember from 'ember';

export default Ember.Route.extend({
    setupController: function(controller, model) {
        this._super(controller, {});
        this.controllerFor('chart-picker')
            .send('switchToChart', null);
        if (model.facilities !== undefined) {
            this.controllerFor('facilities').set('model', model.facilities);
        }
    },
    // actions: {
    //     setAffected: function(ps, _, affected) {
    //         this.controllerFor('requirements').setAffectedParamset(ps, affected);
    //     }
    // }
    model: function() {
        var models = {},
            facilities = this.controllerFor('facilities'),
            dataValues = this.store.all('data-value');
        if (facilities.get('length') === 0) {
            console.log('loading facilities');
            models.facilities = this.store.find('facility', {paging: false});
        }

        if (dataValues.get('length') === 0) {
            console.log('loading data-values');
            models.dataValues = this.store.find('data-value');
        }

        return Ember.RSVP.hash(models);
    }
});
