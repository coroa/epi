import Em from 'ember';
import Enums from '../enums';
import insertSortedBy from '../utils/insert-sorted-by';

var formatter = {
    level: function(key) { return key; },
    service: function(key) { return Enums.service.options[key]['short']; },
    temperature: function(key) {
        return Enums.temperature.options[key].label;
    },
    vaccine: function(vac) {
        return vac.get('initials') +
            ' (' + vac.get('doses_per_vial') + ')';
    }
};

export default Em.Controller.extend({
    needs: ['levels'],
    updateTrigger: true,

    levels: function() {
        return this.get('controllers.levels').map(function(i) {
            return { value: i.get('id'),
                     label: i.get('name') };
        });
    }.property('controllers.levels.@each.{id,name}'),
    services: Enums.service.options.map(function(d, i) {
        return { value: i, label: d.word };
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
                    return item[f.key] !== f.value;
                })) {
                    return accum;
                }

                var primary = item.get(this.get('primary')),
                    secondary = item.get(this.get('secondary')),
                    stack = item.get(this.get('stack'));

                if([primary, secondary, stack].any(Em.isNone)) {
                    return accum;
                }

                // this.propertyWillChange('data');

                var primaryObj = accum.values.findBy('key', primary);
                if (primaryObj === undefined) {
                    primaryObj = Em.Object.create({ key: primary, values: [] });
                    insertSortedBy(accum.values, primaryObj, 'key');
                }
                primaryObj.set('label',
                               formatter[this.get('primary')](primary));

                var secondaryObj = primaryObj.values.findBy('key', secondary);
                if (secondaryObj === undefined) {
                    secondaryObj = Em.Object.create({ key: secondary,
                                                      values: [] });
                    insertSortedBy(primaryObj.values, secondaryObj, 'key');
                }
                secondaryObj.set('label',
                                 formatter[this.get('secondary')](secondary));
                secondaryObj.incrementProperty('total', item.storage_volume);
                if (this.get('secondary') === 'temperature') {
                    secondaryObj.set('colour', Enums.temperature.options[secondary].colour);
                }

                var stackObj = secondaryObj.values.findBy('key', stack);
                if (stackObj === undefined) {
                    insertSortedBy(secondaryObj.values,
                                   Em.Object.create(
                                       { key: stack,
                                         label: formatter[this.get('stack')](stack),
                                         value: item.storage_volume,
                                         isAffected: item.isAffected }),
                                   'key');
                } else {
                    stackObj.incrementProperty('value', item.storage_volume);
                    stackObj.set('isAffected', item.isAffected);
                }

                if (secondaryObj.total > accum.maxValue) {
                    accum.set('maxValue', secondaryObj.total);
                }

                // this.propertyDidChange('data');
                this.toggleProperty('updateTrigger');
                return accum;
            },
            removedItem: function(accum, item, changeMeta) {
                var f = function(key) {
                    return (changeMeta.previousValues !== undefined &&
                        changeMeta.previousValues[key] !== undefined)
                        ? changeMeta.previousValues[key] : item.get(key);
                };

                if (this.get('filter').any(function(filter) {
                    return (f(filter.key) != filter.value);
                })) {
                    return accum;
                }

                var primary = f(this.get('primary')),
                    secondary = f(this.get('secondary')),
                    stack = f(this.get('stack'));

                if ([primary, secondary, stack].any(Em.isNone)) {
                    return accum;
                }

                var storage_volume = f('storage_volume'),
                    primaryObj = accum.values.findBy('key', primary),
                    secondaryObj = primaryObj.values.findBy('key', secondary),
                    stackObj, total;
                Em.assert("Secondary Object not found in removedItem",
                          !Em.isNone(secondaryObj));

                stackObj = secondaryObj.values
                    .findBy('key', stack);
                Em.assert("Stack Object not found in removedItem",
                          !Em.isNone(stackObj));
                total = secondaryObj.total;

                // this.propertyWillChange('data');

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

                if (Math.abs(total - accum.get('maxValue')) < 1e-5) {
                    accum.set('maxValue', accum.values.reduce(function(prev, cur) {
                        return Math.max(prev, cur.values.reduce(function(p, c) {
                            return Math.max(p, c.total);
                        }, 0));
                    }, 0));
                }

                // this.propertyDidChange('data');
                // this.set('updateTrigger', true);

                return accum;
            }
        })
});
