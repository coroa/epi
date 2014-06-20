import Ember from 'ember';

export default Ember.CollectionView.extend({
    itemViewClass: 'chart-pane',

    // bound property selected specifies which chart to show
    // charts are passed in as content, interpreted by the CollectionView
    selected: null
});
