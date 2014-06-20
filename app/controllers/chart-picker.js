import Em from 'ember';
import Enums from '../enums';

export default Em.ObjectController.extend({
    selected_chart: null,

    charts: Enums.charts.options.map(function(x, id) {
        return { id: id, label: x.label,
                 template: x.template,
                 controller: x.controller };
    }),
    footerCollapsed: Em.computed.none('selected_chart'),

    actions: {
        switchToChart: function(chart) {
            this.set('selected_chart', chart);
        }
    }
});
