import Em from 'ember';
import Enums from '../enums';

var insertSortedBy = function(array, item, key) {
    var value = item.get(key), i=0;
    while (i < array.length && array.objectAt(i).get(key) < value) { i ++; }
    return array.insertAt(i, item);
},
    formatter = {
    level: function(id) { return id; },
    service: function(id) { return Enums.service.options[id].label; },
    temperature: function(id) {
        return Enums.temperature.options[id].label;
    },
    vaccine: function(vac) {
        return vac.get('initials') +
            ' (' + vac.get('doses_per_vial') + ')';
    }
};

export default Em.Controller.extend({
    needs: ['levels'],
    categories: true,
    staticDataLabels: true,

    // level, service, temperature can take as selection:
    // one of 'primary', 'secondary', 'stack' or a concrete value,
    // the filter property collects all concrete values
    // input
    level: 'primary',
    service: 0,
    temperature: 'secondary',

    // output
    primary: 'level',
    secondary: 'temperature',
    stack: 'vaccine',
    filter: function() {
        var states = [ 'primary', 'secondary', 'stack' ], f = [];
        ['level', 'service', 'temperature'].map(function(p) {
            if (! states.contains(this.get(p))) {
                f.push({ key: p, value: this.get(p) });
            }
        }, this);
        return f;
    }.property('level', 'service', 'temperature'),
    data: Em.reduceComputed(
        'controllers.levels.storage_volume',
        {
            initialValue: function() {
                return Em.Object.create({ maxValue: 0, values: []});
            },
            addedItem: function(accum, item, changeMeta) {
                if (this.get('filter').any(function(f) {
                    return item[f.key] != f.value;
                })) {
                    return accum;
                }

                var primary = item.get(this.get('primary')),
                    secondary = item.get(this.get('secondary')),
                    stack = item.get(this.get('stack'));

                this.propertyWillChange('data');

                var primaryObj = accum.values.findBy('id', primary);
                if (primaryObj === undefined) {
                    primaryObj = Em.Object.create({ id: primary, values: [] });
                    insertSortedBy(accum.values, primaryObj, 'id');
                }
                primaryObj.set('key',
                               formatter[this.get('primary')](primary));

                var secondaryObj = primaryObj.values.findBy('id', secondary);
                if (secondaryObj === undefined) {
                    secondaryObj = Em.Object.create({ id: secondary,
                                                      values: [] });
                    insertSortedBy(primaryObj.values, secondaryObj, 'id');
                }
                secondaryObj.set('key',
                                 formatter[this.get('secondary')](secondary));
                secondaryObj.incrementProperty('total', item.storage_volume);

                insertSortedBy(secondaryObj.values,
                               Em.Object.create(
                                   { key: formatter[this.get('stack')](stack),
                                     value: item.storage_volume}),
                               'key');


                if (secondaryObj.total > accum.maxValue) {
                    accum.set('maxValue', secondaryObj.total);
                }

                this.propertyDidChange('data');
                return accum;
            },
            removedItem: function(accum, item, changeMeta) {
                if (!changeMeta.previousValues) { return accum; }

                if (this.get('filter').any(function(f) {
                    return ((changeMeta.previousValues[f.key] || item[f.key])
                            != f.value);
                })) {
                    return accum;
                }

                var primary = changeMeta.previousValues[this.get('primary')]
                        || item.get(this.get('primary')),
                    secondary = changeMeta.previousValues[this.get('secondary')]
                        || item.get(this.get('secondary')),
                    stack = changeMeta.previousValues[this.get('stack')]
                        || item.get(this.get('stack')),
                    storage_volume = changeMeta.previousValues.storage_volume
                        || item.get('storage_volume'),
                    primaryObj = accum.values.findBy('id', primary),
                    secondaryObj = primaryObj.values.findBy('id', secondary),
                    stackObj = secondaryObj.values
                        .findBy('key', formatter[this.get('stack')](stack)),
                    total = secondaryObj.total;

                this.propertyWillChange('data');

                // remove them
                secondaryObj.values.removeObject(stackObj);
                if (secondaryObj.values.length === 0) {
                    primaryObj.values.removeObject(secondaryObj);
                    if (primaryObj.values.length === 0) {
                        accum.values.removeObject(primaryObj);
                    }
                } else {
                    secondaryObj.decrementProperty('total', storage_volume);
                }

                if (total === accum.maxValue) {
                    accum.set('maxValue', accum.values.reduce(function(prev, cur) {
                        return Math.max(prev, cur.values.reduce(function(p, c) {
                            return Math.max(p, c.total);
                        }));
                    }));
                }

                this.propertyDidChange('data');

                return accum;
            }
        })
});
