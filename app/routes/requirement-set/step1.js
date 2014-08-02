import Ember from 'ember';
import Enums from '../../enums';

export default Ember.Route.extend({
    setupController: function() {
        this._super();
        this.controllerFor('chart-picker')
            .send('switchToChart', Enums.charts.VOLPERCOURSE);
    },
    actions: {
        setAffected: function(_, req, affected) {
            this.controllerFor('requirements')
                .setAffectedParamset(req.get('levelParamsets'), affected);
        }
    }
});
