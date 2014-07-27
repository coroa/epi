import Ember from 'ember';
import BarChart from '../utils/bar-chart';

export default Ember.Component.extend({
    classNames: ['chart'],
    staticDataLabels: true,
    needsUpdate: true,

    chart: function() {
        return BarChart()
            .manyColors(true)
            .staticDataLabels(this.get('staticDataLabels'));
    }.property('staticDataLabels', 'categories'),

    scheduleUpdate: function() {
        Ember.run.scheduleOnce('render', this, 'update');
        this.set('needsUpdate', false);
    }.observes('needsUpdate').on('didInsertElement'),

    update: function() {
        d3.select(this.$()[0])
            .data([ this.get('data') ])
            .call(this.get('chart'));
    }
});
