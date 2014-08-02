import Ember from 'ember';
import Enums from '../../enums';

export default Ember.Route.extend({
    setupController: function() {
        this._super.apply(this, arguments);
        this.controllerFor('chart-picker')
            .send('switchToChart', Enums.charts.VOLPERLEVEL);
    },
    actions: {
        setAffected: function(ps, _, affected) {
            this.controllerFor('requirements').setAffectedParamset(ps, affected);
        }
    }
});
