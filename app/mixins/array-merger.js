import Ember from 'ember';

/**
 `ArrayMergerMixin`

 @class ArrayMergerMixin
 */

export default Ember.Mixin.create({
    concatenatedProperties: ['mapFn'],
    composedMapFn: function() {
        var _this = this;
        return function(item) {
            _this.get('mapFn').forEach(function(fn) {
                _this[fn].call(_this, item);
            });
            return item;
        };
    }.property('mapFn.[]'),

    /**
     * `topArray` is supposed to hold the toplevel array, which we
     * will watch for additions and removals.
     */
    topArray: null,

    /**
     * `elementPath` defines the path to the inner arrays, which will
     * be merged together. It is split into `_sourcePath`, the path to
     * the object on which a watched array lives, and `_sourceKey`,
     * the attribute name of a to-be-watched array.
     */
    elementPath: null,

    _sourcePath: function() {
        var elementPath = this.get('elementPath'),
            index = elementPath.lastIndexOf('.');
        return index !== -1 ? elementPath.slice(0, index) : '';
    }.property('elementPath'),
    _sourceKey: function() {
        var elementPath = this.get('elementPath'),
            index = elementPath.lastIndexOf('.');
        return index !== -1 ? elementPath.slice(index + 1) : elementPath;
    }.property('elementPath'),

    init: function() {
        this._super();

       // setup observers, which add and delete sources
        var topArray = this.get('topArray');
        Ember.assert('`topArray` must hold an array',
                     Ember.isArray(topArray));

        topArray.addArrayObserver(
            this,
            {willChange: '_arrayRemoveSource',
             didChange: '_arrayAddSource'}
        );

        Ember.run.schedule('actions', this, this._arrayAddSource,
                           topArray, 0, 0, topArray.get('length'));
    },

    willDestroy: function() {
        var topArray = this.get('topArray');
        this._arrayRemoveSource(topArray, 0, topArray.get('length'), 0);
        topArray.removeArrayObserver(
            this,
            {willChange: '_arrayRemoveSource',
             didChange: '_arrayAddSource'}
        );

        this._super();
    },

    /**
     * When the topArray is about to have added/removed new rows,
     * `arrayRemoveSource` will be triggered.
     *
     * It removes the observers from those items, which will be gone
     * after the change.
     *
     * @param {Object} topArray
     * @param {Number} start The index where items will be added/removed
     * @param {Number} removed Number of items that are about to be removed
     * @param {Number} added Number of items that are about to be added
     * @private
     */
    _arrayRemoveSource: function(topArray, start, removed) {
        var sourcePath = this.get('_sourcePath'),
            sourceKey = this.get('_sourceKey');
        // console.log('_arrayRemoveSource, removing',
        //             topArray.slice(start, start+removed).map(function(item) {
        //                 return item.toString();
        //             }).join(","));
        topArray.slice(start, start+removed)
            .forEach(function(item) {
                this.removeSource(Ember.get(item, sourcePath), sourceKey);
            }, this);
    },

    /**
     * When the topArray just had new rows added/removed,
     * `arrayAddSource` will be triggered.
     *
     * It adds observers to the new items.
     *
     * @param {Object} topArray
     * @param {Number} start The index where items were added/removed from
     * @param {Number} removed Number of items that have been removed
     * @param {Number} added Number of items that have been added
     * @private
     */
    _arrayAddSource: function(topArray, start, removed, added) {
        var sourcePath = this.get('_sourcePath'),
            sourceKey = this.get('_sourceKey'),
            mapFn = this.get('composedMapFn');
        // console.log('_arrayAddSource, adding',
        //             topArray.slice(start, start+added).map(function(item) {
        //                 return item.toString();
        //             }).join(","));
        topArray.slice(start, start+added)
            .forEach(function(item) {
                this.addSource(Ember.get(item, sourcePath), sourceKey, mapFn);
            }, this);
    }

});
