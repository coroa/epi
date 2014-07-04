import Ember from 'ember';
import Enums from '../enums';

export default Ember.Route.extend({
    setupController: function() {
        this._super();
        this.controllerFor('chart-picker')
            .send('switchToChart', Enums.charts.VOLPERLEVEL);
    },
    actions: {
        setAffectedParamset: function(ps, affected) {
            this.controllerFor('levels').setAffectedParamset(ps, affected);
        }
    }
});
