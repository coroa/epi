import Ember from 'ember';
import DS from 'ember-data';

import FrequencyChart from '../utils/frequency-chart';

/* global d3 */

// Ignore the d3 style of invoking constructors without new
/* jshint -W064 */

var RSVP = Ember.RSVP,
    a_concat = [].concat,
    traverseToLevel = function(level, facilities) {
        return RSVP.all(facilities.map(function(f) {return f.get('wrappedChildren');}))
            .then(function(listOfChildren) {
                return a_concat.apply([], listOfChildren.invoke('toArray'));
            })
            .then(function(facilities) {
                if (facilities.length === 0 || facilities[0].get('level') === level) {
                    return facilities;
                } else {
                    return traverseToLevel(level, facilities);
                }
            });
    };

export default Ember.Component.extend({
    /**
     * The `parent` attribute expects a binding to a facility. All
     * facilities included in the frequency-chart, will be children of
     * this facility.
     *
     * @property parent
     * @type Facility
     */
    parent: null,

    /**
     * The `level` attribute wants the level of the facilities to
     * show.
     *
     * @property level
     * @type Level (Model of)
     */
    level: null,

    /**
     * The `temperature` attribute selecting the temperature to inspect
     *
     * @property temperature
     * @type Integer (Enum from Enums.temperature)
     */
    temperature: null,

    /**
     * The `facilities` property recursively traverses the children of
     * `parent` and returns all the children of the level `level`
     *
     * @property facilities
     * @type PromiseArray of Facilities
     */
    facilities: function() {
        var parent = this.get('parent'),
            level = this.get('level');
        if ([parent, level].any(Ember.isNone)) {
            return [];
        }
        Ember.assert("The requested level must be bigger than the current level",
                     level.get('id') >= parent.get('level.id'));

        return DS.PromiseArray.create({promise:traverseToLevel(level,[parent])});
    }.property('parent', 'level'),

    /**
     * The `TemperatureCell` elements of all facilities at `level` and
     * `temperature`. They hold updated properties for `requirement`,
     * `capacity` and `difference`.
     *
     * @property temperatureCells
     * @type Array of TemperatureCell
     */
    temperatureCells: function() {
        var facilities = this.get('facilities'),
            temperature = this.get('temperature');
        if ([facilities, temperature].any(Ember.isNone)
            || ! facilities.get('isFulfilled'))
        {
            return [];
        }

        return facilities.map(function(f) {
            return f.get('data').objectAt(temperature);
        });
    }.property('facilities.@each.data', 'temperature'),

    /**
     * The `differences` of the facilities (requirement - capacity).
     * These are the values we want to build the frequency-chart of.
     *
     * @property differences
     * @type Array of Floats
     */
    differences: Ember.computed.mapBy('temperatureCells', 'difference'),

    /**
     * The `values` property zips the differences with their
     * respective facilities. This is the data-basis for the d3 part
     * of the frequency-chart.
     *
     * An element looks like
     * ```javascript
     * { difference: <difference>,
     *   facility: <facility controller> }
     * ```
     *
     * @property values
     * @type Array of Objects
     */
    values: function() {
        var facilities = this.get('facilities');
        if (! facilities.get('isFulfilled')) { return []; }
        return this.get('differences').map(function(diff, i) {
            return { difference: diff,
                     facility: facilities.objectAt(i) };
        });
    }.property('differences', 'facilities.[]'),

    classNames: ['chart'],
    chart: function() {
        return FrequencyChart();
    }.property(),

    scheduleUpdate: function() {
        Ember.run.scheduleOnce('render', this, 'update');
    }.observes('values', 'chart').on('didInsertElement'),
    update: function() {
        var $el = this.$();
        if ($el) {
            d3.select($el[0])
                .data([this.get('values')])
                .call(this.get('chart'));
        }
    }
});
