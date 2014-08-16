import Ember from 'ember';
import SurplusChart from '../utils/surplus-chart';

/* global d3 */

// Ignore the d3 style of invoking constructors without new
/* jshint -W064 */

export default Ember.Component.extend({
    classNames: ['chart','surplus'],
    staticDataLabels: true,

    chart: function() {
        return SurplusChart()
            .staticDataLabels(this.get('staticDataLabels'));
    }.property('staticDataLabels'),

    filteredData: function() {
        var data = this.get('data');
        if (data) {
            return data.filterBy('hasValue');
        } else {
            return [];
        }
    }.property('data.@each.hasValue'),
    maxValues: Ember.computed.mapBy('filteredData', 'maxValue'),
    maxValue: Ember.computed.max('maxValues'),

    scheduleUpdate: function() {
        Ember.run.scheduleOnce('render', this, 'update');
    }.observes('filteredData.[]', 'maxValue', 'chart').on('didInsertElement'),

    update: function() {
        var $el = this.$();
        if ($el) {
            d3.select($el[0])
                .data([ { maxValue: this.get('maxValue'),
                          data: this.get('filteredData') } ])
                .call(this.get('chart'));
        }
    }
});
