import Ember from 'ember';
import SurplusChart from '../utils/surplus-chart';

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
    // filteredData: Ember.computed.filterBy('data', 'hasValue'),
    maxValues: Ember.computed.mapBy('filteredData', 'maxValue'),
    maxValue: Ember.computed.max('maxValues'),
    // maxValue: function() {
    //     return Math.max.apply(0, this.get('filteredData').mapBy('maxValue'));
    // }.property('filteredData.@each.maxValue'),

    dataSorting: ['totalDifference:desc'],
    sortedData: Ember.computed.sort('filteredData', 'dataSorting'),

    scheduleUpdate: function() {
        Ember.run.scheduleOnce('render', this, 'update');
    }.observes('sortedData.[]', 'maxValue', 'chart').on('didInsertElement'),

    update: function() {
        var $el = this.$();
        if ($el) {
            console.log('Doing an update. maxValue is at', this.get('maxValue'));
            d3.select($el[0])
                .data([ { maxValue: this.get('maxValue'),
                          data: this.get('sortedData') } ])
                .call(this.get('chart'));
        }//  else {
        //     Ember.run.scheduleOnce('afterRender', this, 'update');
        // }
    }
});
