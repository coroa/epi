import Ember from 'ember';
import MergedArray from '../utils/merged-array';
import ArrayMergerMixin from '../mixins/array-merger';
import compose from '../utils/compose';

function findIndexByBounded(arr, key, value, from, to) {
    var i = from;
    while(i < to) {
        if (arr.objectAt(i).get(key) === value) {
            return i;
        }
        i++;
    }
    return -1;
}

function findIndexBy(arr, key, value) {
    var i = 0, to = arr.get('length');
    while(i < to) {
        if (arr.objectAt(i).get(key) === value) {
            return i;
        }
        i++;
    }
    return -1;
}

/**
 * `AffectedArrayMerger` extends `MergedArray` by a setAffected
 * function, which handles an attribute isAffected on every element in
 * the merged array.
 *
 * @class AffectedArrayMerger
 * @extends MergedArray
 * @uses ArrayMergerMixin
 */
export default MergedArray.extend(ArrayMergerMixin, {
    init: function() {
        this.set('_affected', Ember.A());
        this._super();
    },

    /**
     * mapFn is the list of functions, which will be called on any new
     * item.It is defined as a concatenated property, so you can only
     * add more functions.
     *
     * the function in this file, will take care of keeping the
     * `isAffected` property stable across data updates.
     *
     * @property mapFn
     * @type Array of method names on this
     */
    mapFn: [ '_update_affected' ],

    _update_affected: function(item) {
        Ember.set(item, 'isAffected',
                  this.get('_affected').contains(item.get('paramsetId')));
    },

    /**
     * `setAffected` will be called in reaction to a setAffected event
     * on the route. It has to update the `isAffected` status of the
     * elements in the merged array, which corresponds to `paramset`.
     *
     * @method setAffected
     * @private
     * @param {DS.Model} paramset The paramset (or array of paramsets)
     * @param {Boolean} affected The desired status of isAffected
     */
    setAffected: function(paramset, affected) {
        // If paramset is an array, call ourselves repeatedly
        if (Em.isArray(paramset)) {
            paramset.forEach(function(p) {this.setAffected(p,affected);}, this);
        }

        var index = findIndexBy(this, 'paramsetId', paramset.get('id')),
            item;
        if (index === -1) {
            console.log('Called setAffected on a paramset, this'
                        + ' ArrayMerger knows nothing about.'
                        + ' Embarassing.');
            return;
        }
        item = this.objectAt(index);
        Ember.set(item, 'isAffected', affected);

        // replacing shouldn't be necessary, but updates don't run overwise
        this.replace(index, 1, [item]);

        if (affected) {
            this.get('_affected').addObject(paramset.get('id'));
        } else {
            this.get('_affected').removeObject(paramset.get('id'));
        }
    }
});
