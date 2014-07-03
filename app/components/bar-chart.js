import Ember from 'ember';
import BarChart from '../utils/bar-chart';

export default Ember.Component.extend({
    classNames: ['chart'],
    staticDataLabels: true,
    categories: true,
    updateTrigger: true,

    chart: function() {
        return BarChart()
            .manyColors(true)
            .staticDataLabels(this.get('staticDataLabels'))
            .categories(this.get('categories'));
    }.property('staticDataLabels', 'categories'),

    scheduleUpdate: function() {
        Ember.run.scheduleOnce('render', this, 'update');
    }.observes('data.@each','updateTrigger').on('didInsertElement'),

    update: function() {
        d3.select(this.$()[0])
            .data([ this.get('data') ])
            .call(this.get('chart'));
    }
});
