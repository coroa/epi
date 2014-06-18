App.ChartPanesView = Em.CollectionView.extend({
    itemViewClass: App.ChartPaneView,

    // bound property selected specifies which chart to show
    // charts are passed in as content, interpreted by the CollectionView
    selected: null
});

Ember.Handlebars.helper('chart-panes', App.ChartPanesView);
