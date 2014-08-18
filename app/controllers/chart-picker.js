import Em from 'ember';
import Enums from '../enums';

export default Em.ObjectController.extend({
    selected_chart: null,

    charts: Enums.charts.options.map(function(x, id) {
        return Ember.$.extend({ id: id }, x);
    }),
    footerCollapsed: Em.computed.none('selected_chart'),

    actions: {
        switchToChart: function(chart) {
            this.set('selected_chart', chart);
        }
    }
});
