import Ember from 'ember';
import DS from 'ember-data';

import FrequencyChart from '../utils/frequency-chart';

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
     * The `binNumber` attribute holds the number of bins.
     *
     * @property binNumber
     * @type Integer
     * @default 10
     */
    binNumber: 10,

    min: Ember.computed.min('differences'),
    max: Ember.computed.max('differences'),

    /**
     * The `data` attribute is fed into d3. It has approximately the
     * following structure:
     * ```javascript
     * { maxValue: <highest count number>,
     *   binSize: <size of a bin>,
     *   start: <value a bit left of the minimum>,
     *   end: <value a bit right of the maximum>,
     *   bins: [
     *     { from: <left>, to: <right>, count: <number in bin>,
     *       facilities: <facilities in bin> },
     *     ....
     *   ] }
     * ```
     *
     * @property data
     * @type Object (see above)
     */

    // data: function() {
    //     var binNumber = this.get('binNumber'),
    //         max = this.get('max'), min = this.get('min'),
    //         binSize = (max - min)*1.1/binNumber,
    //         facilities = this.get('facilities'),
    //         start = min - (max - min)*0.05, bins = [],
    //         maxValue = 0;
    //     for (var i=0; i<binNumber; i++) {
    //         bins.push({ from: start, to: start+binSize, count: 0,
    //                     facilities: [] });
    //     }
    //     this.get('differences').forEach(function(diff, i) {
    //         var bin = bins[(diff - start) % binSize];
    //         bin.count ++;
    //         bin.facilities.push(facilities.objectAt(i));
    //     });
    //     maxValue = Math.max.apply(null, bins.mapBy('count'));
    //     return { bins: bins, maxValue: maxValue, binSize: binSize,
    //              start: start, end: start + binSize * binNumber };
    // }.property('differences', 'binsSpread', 'binSize', 'binNumber'),

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
