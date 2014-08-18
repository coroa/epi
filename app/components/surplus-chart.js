import Ember from 'ember';
import SurplusChart from '../utils/surplus-chart';

/* global d3 */

// Ignore the d3 style of invoking constructors without new
/* jshint -W064 */

export default Ember.Component.extend({
    classNames: ['chart','surplus'],
    staticDataLabels: true,
    unit: 'Lts.',

    chart: function() {
        return SurplusChart()
            .staticDataLabels(this.get('staticDataLabels'))
            .highlightedFacility(this.get('highlightedFacility.id'))
            .yUnitLabel(this.get('unit'))
            .temperature(this.get('temperature'))
            .emberComponent(this);
    }.property('staticDataLabels', 'highlightedFacility', 'unit'),

    updateTemperature: function() {
        this.get('chart').temperature(this.get('temperature'));
    }.observes('temperature'),

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
    }.observes('filteredData.[]', 'maxValue', 'chart', 'temperature').on('didInsertElement'),

    update: function() {
        var $el = this.$();
        if ($el) {
            d3.select($el[0])
                .data([ { maxValue: this.get('maxValue'),
                          data: this.get('filteredData') } ])
                .call(this.get('chart'));
        }
    },

    actions: {
        clickFacility: function(facility) {
            this.set('highlightedFacility',
                     this.get('highlightedFacility') === facility ?
                     null : facility);
        }
    }
});
