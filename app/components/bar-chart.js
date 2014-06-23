import Ember from 'ember';
import BarChart from '../utils/bar-chart';

export default Ember.Component.extend({
    classNames: ['chart'],
    staticDataLabels: true,

    chart: function() {
        return BarChart()
            .margin({left: 40, top: 40, bottom: 5, right: 40})
            .manyColors(true)
            .rotateAxisLabels(true)
            .staticDataLabels(this.get('staticDataLabels'));
    }.property('staticDataLabels'),

    didInsertElement: function() {
        this.scheduleUpdate();
    },

    scheduleUpdate: function() {
        Ember.run.scheduleOnce('render', this, 'update');
    }.observes('data.@each'),

    update: function() {
        d3.select(this.$()[0])
            .data([ this.get('data') ])
            .call(this.get('chart'));
    }
});
