import Ember from 'ember';

/**
 * `MergedArray` is an array that observes multiple other arrays
 * (called source arrays) for changes and includes all items from all
 * source arrays in an efficient way.
 *
 * Usage:
 *
 * ```javascript
 * var obj = Ember.Object.create({
 *   people: [
 *      {
 *          name: "John"
 *      }
 *   ],
 *   pets: [
 *      {
 *          name: "Fido",
 *          species: "dog"
 *      }
 *   ]
 * });
 * var everybody = MergedArray.create();
 * everybody.addSource(obj, 'people', function(person) {
 *     return {
 *         description: person.get('name') + ' is a person';
 *     }
 * });
 * everybody.addSource(obj, 'pets', function(pet) {
 *     return {
 *         description: pet.get('name') + ' is a ' + pet.get('species');
 *     }
 * });
 * console.log(everybody.mapBy('description')); //Logs ['John is a person', 'Fido is a dog']
 * ```
 * @class MergedArray
 * @extends Ember.ArrayProxy
 */

export default Ember.ArrayProxy.extend({
    init: function() {
        //We need these private properties to store information about the sources
        this._sources = {};
        this._observerProxies = {};
        //This is an array proxy, so we need to initiate it's content with an empty array
        this.set('content', Ember.A());
        this.set('_positions', Ember.A());
        this.set('_changequeue', Ember.A());

        // Super comes at the end, as an ArrayProxy expects to have
        // its content, BEFORE being initialised
        this._super();
    },

    /**
     * Call this method to add a source to be merged into this array.
     *
     * @param {Object} sourceObj The object that holds the source as a property.
     * @param {String} sourceKey The name of the property that holds the source.
     * @param {Function|null} mapFn A function that maps a source
     *        record into a uniform object so that all items in this
     *        array are compatible. If not set, the real source record
     *        will be used, i.e. no mapping will take place.
     */
    addSource: function(sourceObj, sourceKey, mapFn) {
        //If mapFn is unset we default to a function that simply returns the same item
        if (!mapFn) {
            mapFn = function(item) {
                return item;
            };
        }
        //Store information about the source (combination of `sourceObj` and `sourceKey`) in a private property
        this._sources[Ember.guidFor(sourceObj)+sourceKey] = {
            sourceObj: sourceObj,
            sourceKey: sourceKey,
            mapFn: mapFn
        };
        //Observe `sourceObj` for when the `sourceKey` property changes.
        sourceObj.addBeforeObserver(sourceKey, this._getObserverProxy('_sourceWillChange', sourceObj, sourceKey));
        sourceObj.addObserver(sourceKey, this._getObserverProxy('_sourceDidChange', sourceObj, sourceKey));
        //Trigger that the source did change, so we can add items from the source right away and array content observers
        this._sourceDidChange(sourceObj, sourceKey);
    },

    /**
     * Call this method to remove a source from this array.
     *
     * @param {Object} sourceObj The object that holds the source as a property.
     * @param {String} sourceKey The name of the property that holds the source.
     */
    removeSource: function(sourceObj, sourceKey) {
        //Remove observers on `sourceObj`
        Ember.removeBeforeObserver(sourceObj, sourceKey, this._getObserverProxy('_sourceWillChange', sourceObj, sourceKey));
        sourceObj.removeObserver(sourceKey, this._getObserverProxy('_sourceDidChange', sourceObj, sourceKey));
        //Forget about observer proxies - we don't need them anymore
        this._removeObserverProxy('_sourceWillChange', sourceObj, sourceKey);
        this._removeObserverProxy('_sourceDidChange', sourceObj, sourceKey);
        //Trigger that the source will change, so we can remove items from this merged array and remove array content observers
        this._sourceWillChange(sourceObj, sourceKey);

        delete this._sources[Ember.guidFor(sourceObj) + sourceKey];
    },

    /**
     * This method is used to always return the same function for a
     * specific source.
     *
     * We need it so we can easily remove the observers that we setup
     * when we no longer need them.
     *
     * @param {String} method The name of a method in this class
     * @param {Object} sourceObj
     * @param {String} sourceKey
     * @returns {Function}
     */
    _getObserverProxy: function(method, sourceObj, sourceKey) {
        var k = method + Ember.guidFor(sourceObj) + sourceKey,
            proxy = this._observerProxies[k];
        if (!proxy) {
            proxy = this._observerProxies[k] = Ember.$.proxy(this[method], this, sourceObj, sourceKey);
        }
        return proxy;
    },

    /**
     * When we're done using an observer function we should forget about it.
     *
     * @param {String} method
     * @param {Object} sourceObj
     * @param {String} sourceKey
     */
    _removeObserverProxy: function(method, sourceObj, sourceKey) {
        var k = method + Ember.guidFor(sourceObj) + sourceKey;
        delete this._observerProxies[k];
    },

    /**
     * When this array is destroyed we need to clean up all the
     * observers we've setup on the source arrays.
     */
    willDestroy: function() {
        this._super();
        var sources = this._sources,
            source;

        //remove each registered source
        for (var k in sources) {
            if (!sources.hasOwnProperty(k)) continue;
            source = sources[k];
            this.removeSource(source.sourceKey, source.sourceObj);
        }
        delete this._sources;
    },

    /**
     * When a source array is about to change (not when the content
     * changes, but when the whole array is replaced) we need to
     * remove content observers from the old source array.
     *
     * @param {Object} sourceObj
     * @param {String} sourceKey
     * @private
     */
    _sourceWillChange: function(sourceObj, sourceKey) {
        var sourceArray = Ember.get(sourceObj, sourceKey);
        if (Ember.isArray(sourceArray)) {
            this._removePosition(sourceObj, sourceKey);

            //Remove array observers
            sourceArray.removeArrayObserver(this, {
                willChange: this._getObserverProxy('_sourceContentWillChange', sourceObj, sourceKey),
                didChange: this._getObserverProxy('_sourceContentDidChange', sourceObj, sourceKey)
            });
            //Forget about observer proxies - we don't need them anymore
            this._removeObserverProxy('_sourceContentWillChange', sourceObj, sourceKey);
            this._removeObserverProxy('_sourceContentDidChange', sourceObj, sourceKey);
        }
    },

    /**
     * When a source array did change (the whole array was replaced) we need to add content observers to the new array.
     *
     * @param {Object} sourceObj
     * @param {String} sourceKey
     * @private
     */
    _sourceDidChange: function(sourceObj, sourceKey) {
        var sourceArray = Ember.get(sourceObj, sourceKey);
        if (Ember.isArray(sourceArray)) {
            this._addPosition(sourceObj, sourceKey);

            //Add array observers. These will get called every time an item is added to or removed from the source array
            sourceArray.addArrayObserver(this, {
                willChange: this._getObserverProxy('_sourceContentWillChange', sourceObj, sourceKey),
                didChange: this._getObserverProxy('_sourceContentDidChange', sourceObj, sourceKey)
            });
        }
    },

    /**
     * This observer is triggered every time an item from a source
     * array is either about to be added or removed.
     *
     * We will add an entry to our queue, which the
     * `_coalesceAndDoUpdates` function will interpret and execute in
     * due time.
     *
     * @param {Object} sourceObj
     * @param {String} sourceKey
     * @param {Object} sourceArray
     * @param {Number} start The index where items were added/removed from
     * @param {Number} removed Number of items that are about to be removed
     * @param {Number} added Number of items that are about to be added
     * @private
     */
    _sourceContentWillChange: function(sourceObj, sourceKey, sourceArray, start, removed, added) {
        this.get('_changequeue').push(
            { source: this._sources[Ember.guidFor(sourceObj)+sourceKey],
              sourceArray: sourceArray,
              start: start,
              removed: removed,
              added: added,
              oldValues: sourceArray.slice(start, start+removed) }
        );
    },


    /**
     * This observer is triggered right after an item from a source
     * array was either added or removed.
     *
     * We update the last entry on the queue, which must have been set
     * up by `_sourceContentWillChange` before.
     *
     * We add the newValues and schedule the coalescing function.
     *
     * @param {Object} sourceObj
     * @param {String} sourceKey
     * @param {Object} sourceArray
     * @param {Number} start The index where items were added/removed from
     * @param {Number} removed Number of items that was removed
     * @param {Number} added Number of items that was added
     * @private
     */
    _sourceContentDidChange: function(sourceObj, sourceKey, sourceArray, start, removed, added) {
        var queue = this.get('_changequeue'),
            change = queue.objectAt(queue.length - 1),
            source = this._sources[Ember.guidFor(sourceObj)+sourceKey];
        Ember.assert('Array changes should not be intermingled',
                     change.source === source,
                     change.sourceArray === sourceArray &&
                     change.start === start &&
                     change.removed === removed &&
                     change.added === added);
        change.newValues = sourceArray.slice(start, start+added);
        Ember.run.scheduleOnce('actions', this, '_coalesceAndDoUpdates');
    },

    /**
     * This function is usually scheduled in the actions run loop,
     * when all bindings have settled.
     *
     * It empties the queue by applying the requested changes on the
     * content array, AFTER trying to merge multiple different changes
     * into one.
     *
     * @private
     */
    _coalesceAndDoUpdates: function() {
        var positions = this.get('_positions'),
            queue = this.get('_changequeue'),
            ch, next, pos;
        while ((ch = queue.shiftObject()) !== null) {
            pos = ch.source.position;

            while ((next = queue.objectAt(0)) !== undefined) {
                // peek ahead and try to coalesce stuff into the
                // current change object
                if (ch.sourceArray !== next.sourceArray) { break; }

                // this is not the only possible way to coalesce,
                // but probably good enough for a start
                if (ch.start === next.start) {
                    ch.newValues.replace(0, next.removed, next.newValues);
                    ch.oldValues.pushObjects(next.oldValues.slice(ch.added));
                    ch.removed = ch.oldValues.length;
                    ch.added = ch.newValues.length;
                } else {
                    break;
                }

                // we did coalesce next, so remove it from queue
                queue.shiftObject();
            }

            // ch contains all the changes, pos where to update them

            // check if anything did change, at all
            if (ch.oldValues.length === ch.newValues.length) {
                var j;
                for (j=0; j<ch.oldValues.length; j++) {
                    if (ch.oldValues[j] !== ch.newValues[j]) { break; }
                }
                if (j === ch.oldValues.length) {
                    // nothing did change
                    continue;
                }
            }

            var newValues = ch.newValues.map(ch.source.mapFn);
            console.log('Accumulated changed array at', pos.index
                        + ch.start, 'we\'re removing',
                        ch.removed, 'and adding', ch.newValues.length );
            this.replace(pos.index + ch.start, ch.removed, newValues);
            if (ch.added !== ch.removed) {
                var delta = ch.added - ch.removed;
                pos.length += delta;
                positions.slice(positions.indexOf(pos) + 1)
                    .forEach(function(p) { p.index += delta; });
            }
        }
    },


    /**
     * Helper method to remove a position entry
     *
     * @param {Object} position The entry in positions to be removed
     * @private
     */
    _removePosition: function(sourceObj, sourceKey) {
        var position = this._sources[Ember.guidFor(sourceObj)+sourceKey].position,
            index = this._positions.indexOf(position);
        this._positions.replace(index, 1, []);
        // adapt all the indices after position
        this._positions.slice(index)
            .forEach(function(p) { p.index -= position.length; });

        // remove content
        this.replace(position.index, position.length, []);
    },

    /**
     * Helper method to add a position entry
     *
     * @param {Object} position The entry to be added to _positions
     * @private
     */
    _addPosition: function(sourceObj, sourceKey) {
        var sourceArray = Ember.get(sourceObj, sourceKey),
            source = this._sources[Ember.guidFor(sourceObj)+sourceKey],
            mapFn = source.mapFn,
            position, index = 0;
        if (this._positions.length > 0) {
            var lastPos = this._positions[this._positions.length-1];
            index = lastPos.index + lastPos.length;
        }
        position = { index: index, length: sourceArray.get('length')  };
        this._positions.pushObject(position);
        source.position = position;

        sourceArray.forEach(function(item) {
            this.pushObject(mapFn(item));
        }, this);

        return position;
    }
});
