import Em from 'ember';
import Enums from '../enums';
import fallback from '../utils/fallback';

var make_array = function(n, amends, no_of_sia) {
    var a = [], baseObj;
    if (amends == null) {
        baseObj = Em.Object.extend({
            value2: Em.computed.alias('value')
        });
    } else {
        baseObj = Em.Object.extend({
            value2: fallback('_amendObj.storage_volume', 'value'),
            isCustom: Em.computed.notEmpty('_amendObj.storage_volume')
        });
    }

    for(var i=0; i<n; i++) {
        var obj = baseObj.create({
            isAffected: false,
            value: 0
        });
        if (amends != null) {
            obj.set('_amendObj', amends.objectAt(i));
            var values = Em.A();
            for(var j=0; j<no_of_sia; j++) {
                values.push(Em.Object.create({value: 0}));
            }
            obj.set('values', values);
        }
        a.push(obj);
    }
    return a;
};



export default Em.ArrayController.extend({
    needs: ['levels','sia-storage-volumes'],
    itemController: 'requirement',
    routineService: Em.computed.filterBy('@this', 'service',
                                         Enums.service.ROUTINE),
    schoolService: Em.computed.filterBy('@this', 'service',
                                        Enums.service.SCHOOL),
    siaService: Em.computed.filterBy('@this', 'service',
                                     Enums.service.SIA),
    otherService: Em.computed.filterBy('@this', 'service',
                                       Enums.service.OTHER),

    services: function() {
        return  ['routine','school','sia','other'].map(function(service) {
            var id = Enums.service[service.toUpperCase()];
            return { id: id,
                     label: Enums.service.options[id].label,
                     requirements: this.get(service + 'Service') };
        }, this);
    }.property('routineService', 'schoolService',
               'siaService', 'otherService'),

    // Aggregation of all storage_volume parameters as an array of
    // { level: ps.get('level'),
    //   temperature: ps.get('temperature'),
    //   service: service,
    //   vaccine: vaccine,
    //   storage_volume: ps.get('storage_volume'),
    //   requirementId: this.get('id'),
    //   paramsetId: ps.get('id') })

    storage_volume: Em.ArrayProxy.extend({
        init: function() {
            this.set('content', Em.A([]));
            this.set('_positions', Em.A([]));
            this.set('_changequeue', Em.A([]));
            this.set('_affected_ps', Em.A([]));
            this._super();
        },
        arrayWillChange: function(observedObj, start, removeCount, addCount) {
            // console.log('arrayWillChange', observedObj, start,
            //             removeCount, addCount);
            this.get('_changequeue').push(
                { obj: observedObj,
                  start: start,
                  removeCount: removeCount,
                  addCount: addCount,
                  oldValues: observedObj.slice(start,
                                               start+removeCount) }
            );
        },
        arrayDidChange: function(observedObj, start, removeCount, addCount) {
            // console.log('arrayDidChange', observedObj, start,
            //             removeCount, addCount);

            // would have liked to use lastObject, but it doesn't
            // update fast enough
            var queue = this.get('_changequeue'),
                change = queue.objectAt(queue.length - 1);
            Em.assert('Array changes should not be intermingled',
                         change.obj === observedObj &&
                         change.start === start &&
                         change.removeCount === removeCount &&
                         change.addCount === addCount);
            change.newValues = observedObj.slice(start, start+addCount);
            Em.run.scheduleOnce('actions', this, 'coalesceAndDoUpdates');
        },
        coalesceAndDoUpdates: function() {
            var positions = this.get('_positions'),
                queue = this.get('_changequeue'),
                accum = this.get('content'),
                ch, next, pos;
            while ((ch = queue.shiftObject()) !== null) {
                pos = positions.findBy('obj', ch.obj);

                while ((next = queue.objectAt(0)) !== undefined) {
                    // peek ahead and try to coalesce stuff into the
                    // current change object
                    if (ch.obj !== next.obj) { break; }

                    // this is not the only possible way to coalesce,
                    // but probably good enough for a start
                    if (ch.start === next.start) {
                        ch.newValues.replace(0, next.removeCount,
                                             next.newValues);
                        ch.oldValues.pushObjects(next.oldValues.slice(ch.addCount));
                        ch.removeCount = ch.oldValues.length;
                        ch.addCount = ch.newValues.length;
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

                this.updateItemsForAffected(ch.newValues);
                this.replaceNaNswithZero(ch.newValues);

                console.log('Accumulated changed array at', pos.index
                            + ch.start, 'we\'re removing',
                            ch.removeCount, 'and adding', ch.newValues.length );
                accum.replace(pos.index + ch.start, ch.removeCount,
                              ch.newValues);
                if (ch.addCount !== ch.removeCount) {
                    var delta = ch.addCount - ch.removeCount;
                    pos.length += delta;
                    positions.slice(positions.indexOf(pos) + 1)
                        .forEach(function(p) { p.index += delta; });
                }
            }
        },
        replaceNaNswithZero: function(newValues) {
            newValues.forEach(function(v) {
                if (isNaN(v.get('storage_volume'))) {
                    console.log('Replacing NaN by 0 in storage_volume');
                    v.set('storage_volume', 0);
                }
            });
        },
        updateItemsForAffected: function(newValues) {
            var paramsetIds = this.get('_affected_ps');
            newValues.forEach(function(v) {
                if (paramsetIds.contains(v.get('paramsetId'))) {
                    v.set('isAffected', true);
                }
            });
        },
        setAffected: function(ps, affected) {
            if (Em.isArray(ps)) {
                ps.forEach(function(p) {this.setAffected(p,affected);}, this);
            }
            var req = ps.get('requirement'),
                pos = this.get('_positions')
                    .find(function(p) {return p.req.get('model') === req;});
            if (!Em.isNone(pos)) {
                var findIndexByBounded = function(arr, key, value, from, to) {
                    var i=from;
                    while(i < to) {
                        if (arr.objectAt(i).get(key) === value) {
                            return i;
                        }
                        i++;
                    }},
                    content = this.get('content'),
                    index = findIndexByBounded(
                        content, 'paramsetId', ps.get('id'),
                        pos.index, pos.index+pos.length);
                if (index !== undefined) {
                    var item = content.objectAt(index);
                    item.set('isAffected', affected);
                    // call replace for the array observer to pick up the changes
                    content.replace(index, 1, [item]);
                }
            }
            if (affected) {
                this.get('_affected_ps').addObject(ps.get('id'));
            } else {
                this.get('_affected_ps').removeObject(ps.get('id'));
            }
        },
        addObserved: function(req, obj) {
            var positions = this.get('_positions'),
                pos = positions.findBy('obj', obj);
            if (pos === undefined) {
                obj.addArrayObserver(this);
                console.log("Set up observer for", Enums.service.options[req.get("service")].word, "requirement", req.get('vaccine.initials'));

                // first time encountering this object, so we grab
                // the latest full copy of it
                var accum = this.get('content'),
                    last = positions.objectAt(positions.length-1)
                        || { index: 0, length: 0 };
                pos = { req: req,
                        obj: obj,
                        index: last.index + last.length,
                        length: obj.get('length') };
                positions.pushObject(pos);
                console.log('Grabbing full copy of length',
                            obj.get('length'), 'with the first value',
                            obj.objectAt(0).get('storage_volume'));
                accum.pushObjects(obj);
            }
        }

    }).create(),

    _setup_observers: function() {
        var observer = this.get('storage_volume');
        this.forEach(function(req) {
            observer.addObserved(req, req.get('storage_volume'));
        });
    }.observes('[]').on('didInsertElement'),

    setAffectedParamset: function(ps, affected) {
        this.get('storage_volume').setAffected(ps, affected);
    },


    // Aggregation of all storage_volumes into a result table
    // with one row per service, with temperature and level columns
    // siaStorageVolumeAmends: Em.computed.sort(
    //     'controllers.sia-storage-volumes',
    //     function(a,b) {
    //         return a.get('temperature') - b.get('temperature')
    //             || a.get('level.id') - b.get('level.id');
    //     }),

    // the full table is constructed in resultTableLines
    // resultTableLineForService(id) returns a service specific one
    resultTableHead: function() {
        var levels = this.get('controllers.levels').mapBy('name');
        return Em.Object.create({
            no_levels: levels.length,
            first: Enums.temperature.options.map(function(el) {
                return 'Lts net storage requirement @ ' + el.label;
            }),
            second: [].concat.apply([], Enums.temperature.options.map(function() {
                return levels;
            }))
        });
    }.property('controllers.levels.@each.name'),
    siaServiceIds: Em.computed.mapBy('siaService', 'id'),
    resultTable: Em.reduceComputed(
        'storage_volume',
        'controllers.levels.[]',
        'controllers.sia-storage-volumes.[]',
        'siaServiceIds.[]',
        {
            initialValue: function() { return []; },
            initialize: function(initialValue) {
                var no_levels = this.get('controllers.levels.length'),
                    no_temperatures = Enums.temperature.options.length,
                    no_of_sia = this.get('siaServiceIds.length'),
                    amends = this.get('controllers.sia-storage-volumes');
                initialValue.setObjects(
                    Enums.service.options.map(function(opt) {
                        return Em.Object.create({
                            label: opt.word,
                            content: make_array(
                                no_levels * no_temperatures,
                                opt.id === Enums.service.SIA ? amends : null,
                                no_of_sia
                            )
                        });
                    })
                );
            },
            addedItem: function(accum, item) {
                var f = function(key) { return item.get(key); };

                if ([ f('service'), f('temperature'), f('level') ]
                    .any(Em.isNone)) {
                    return accum;
                }
                console.log('resultTable addedItem for',
                            Enums.service.options[f('service')].word,
                            'requirement', f('vaccine.initials'),
                            'with storage_volume', f('storage_volume'));

                var levels = this.get('controllers.levels').mapBy('id'),
                    row = accum.objectAt(f('service')).get('content'),
                    index = f('temperature') * levels.length +
                        levels.indexOf(f('level').get('id')),
                    obj = row.objectAt(index);
                if (Em.isNone(obj)) { return accum; }

                if (Enums.service.SIA === f('service')) {
                    // we need to take the maximum value rather that
                    // the sum for SIA, and it is possible to overwrite
                    var value = f('storage_volume'),
                        id = this.get('siaServiceIds').indexOf(item.get('requirementId')),
                        siaObj = obj.get('values').objectAt(id);
                    siaObj.set('value', value);
                    siaObj.set('isAffected', f('isAffected'));
                    if (value > obj.get('value')) {
                        obj.set('value', value);
                    }
                } else {
                    obj.incrementProperty('value', f('storage_volume'));
                }
                obj.set('isAffected', f('isAffected'));

                return accum;
            },
            removedItem: function(accum, item) {
                var f = function(key) {return item.get(key);};

                if ([ f('service'), f('temperature'), f('level') ]
                    .any(Em.isNone)) {
                    return accum;
                }

                var levels = this.get('controllers.levels').mapBy('id'),
                    row = accum.objectAt(f('service')).get('content'),
                    index = f('temperature') * levels.length +
                        levels.indexOf(f('level').get('id')),
                    obj = row.objectAt(index);
                if (Em.isNone(obj)) { return accum; }

                if (Enums.service.SIA === f('service')) {
                    // we need to take the maximum value rather than
                    // the sum for SIA, and it is possible to overwrite
                    var value = f('storage_volume'),
                        id = this.get('siaServiceIds').indexOf(item.get('requirementId')),
                        siaObj = obj.get('values').objectAt(id);
                    siaObj.set('value', 0);
                    siaObj.set('isAffected', false);
                    if (value >= obj.get('value')) {
                        // was the maximum, we need to find the new one
                        obj.set('value', Math.max.apply(0, obj.get('values').mapBy('value')));
                    }
                } else {
                    obj.decrementProperty('value', f('storage_volume'));
                }
                obj.set('isAffected', false);

                return accum;
            }
    }),

    // dirty: Em.computed.filterBy('@this', 'isDirty', true),
    dirty: function() {
        return this.filterBy('isDirty');
    }.property('@each.isDirty'),
    isDirty: Em.computed.notEmpty('dirty')
});
