App.ChartPickerController = Em.Controller.extend({
    selected_chart: null,

    charts: App.Enums.charts.options.map(function(x, id) {
        return { id: id, label: x.label,
                 template: x.template };
    }),
    footerCollapsed: Em.computed.none('selected_chart'),

    actions: {
        switchToChart: function(chart) {
            this.set('selected_chart', chart);
        }
    }
});
