import Em from 'ember';
import Enums from '../enums';

var insertSortedBy = function(array, item, key) {
    var value = item.get(key), i=0;
    while (i < array.length && array.objectAt(i).get(key) < value) { i ++; }
    return array.insertAt(i, item);
},
    formatter = {
    level: function(id) { return id; },
    service: function(id) { return Enums.service.options[id]['short']; },
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
    staticDataLabels: true,

    levels: function() {
        return this.get('controllers.levels').map(function(i) {
            return { value: i.get('id'),
                     label: i.get('name') };
        });
    }.property('controllers.levels.@each.{id,name}'),
    services: Enums.service.options.map(function(d, i) {
        return { value: i, label: d['short'] };
    }),
    temperatures: Enums.temperature.options.map(function(d, i) {
        return { value: i, label: d.label };
    }),

    // level, service, temperature can take as selection:
    // one of 'primary', 'secondary', 'stack' or a concrete value,
    // the filter property collects all concrete values
    // input
    level: null,
    service: null,
    temperature: null,

    changeParameters: function() {
        var level = this.get('level'),
            service = this.get('service'),
            temp = this.get('temperature');
        if (service !== null) {
            this.setProperties({ primary: 'level',
                                 secondary: 'temperature',
                                 stack: 'vaccine' });
        } else if (level !== null) {
            this.setProperties({ primary: 'service',
                                 secondary: 'temperature',
                                 stack: 'vaccine' });
        } else if (temp !== null) {
            this.setProperties({ primary: 'level',
                                 secondary: 'service',
                                 stack: 'vaccine' });
        } else {
            this.setProperties({ primary: 'level',
                                 secondary: 'service',
                                 stack: 'temperature' });
        }
    }.observes('level', 'service', 'temperature').on('init'),

    // output
    primary: 'level',
    secondary: 'temperature',
    stack: 'vaccine',
    filter: function() {
        var f  = ['level', 'service', 'temperature']
                .map(function(p) { return {key:p,value:this.get(p)}; }, this)
                .filter(function(p){return ! Em.isNone(p.value);});
        console.log('updated filter: ', f.toArray());
        return f;
    }.property('level', 'service', 'temperature'),
    data: Em.reduceComputed(
        'controllers.levels.storage_volume',
        'primary', 'secondary', 'stack', 'filter.[]',
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
                if (this.get('secondary') === 'temperature') {
                    secondaryObj.set('colour', Enums.temperature.options[secondary].colour);
                }

                var stackObj = secondaryObj.values.findBy('key', formatter[this.get('stack')](stack));
                if (stackObj === undefined) {
                    insertSortedBy(secondaryObj.values,
                                   Em.Object.create(
                                       { key: formatter[this.get('stack')](stack),
                                         value: item.storage_volume}),
                                   'key');
                } else {
                    stackObj.incrementProperty('value', item.storage_volume);
                }

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
                stackObj.decrementProperty('value', storage_volume);
                if (Math.abs(stackObj.get('value')) < 1e-5) {
                    secondaryObj.values.removeObject(stackObj);
                    if (secondaryObj.values.length === 0) {
                        primaryObj.values.removeObject(secondaryObj);
                        if (primaryObj.values.length === 0) {
                            accum.values.removeObject(primaryObj);
                        }
                    }
                }
                secondaryObj.decrementProperty('total', storage_volume);

                if (Math.abs(total - accum.maxValue) < 1e-5) {
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
