import Ember from 'ember';
import BarChart from '../utils/bar-chart';

/* global d3 */

// Ignore the d3 style of invoking constructors without new
/* jshint -W064 */

export default Ember.Component.extend({
    classNames: ['chart'],
    staticDataLabels: true,
    needsUpdate: true,

    chart: function() {
        return BarChart()
            .manyColors(true)
            .staticDataLabels(this.get('staticDataLabels'))
            .yUnitLabel(this.get('unit'));
    }.property('staticDataLabels', 'categories', 'unit'),

    scheduleUpdate: function() {
        Ember.run.scheduleOnce('render', this, 'update');
        this.set('needsUpdate', false);
    }.observes('data.[]','needsUpdate').on('didInsertElement'),

    update: function() {
        d3.select(this.$()[0])
            .data([ this.get('data') ])
            .call(this.get('chart'));
    }
});
