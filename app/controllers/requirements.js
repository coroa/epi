import Em from 'ember';
import Enums from '../enums';

export default Em.ArrayController.extend({
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

    storage_volume: Ember.ArrayProxy.extend({
        init: function() {
            this.set('content', Ember.A([]));
            this.set('_positions', Ember.A([]));
            this.set('_changequeue', Ember.A([]));
            this.set('_affected_ps', Ember.A([]));
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
            Ember.assert('Array changes should not be intermingled',
                         change.obj === observedObj &&
                         change.start === start &&
                         change.removeCount === removeCount &&
                         change.addCount === addCount);
            change.newValues = observedObj.slice(start, start+addCount);
            Ember.run.scheduleOnce('actions', this, 'coalesceAndDoUpdates');
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
            if (Ember.isArray(ps)) {
                ps.forEach(function(p) {this.setAffected(p,affected);}, this);
            }
            var req = ps.get('requirement'),
                pos = this.get('_positions')
                    .find(function(p) {return p.req.get('model') === req;});
            if (!Ember.isNone(pos)) {
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
                accum.pushObjects(obj);

                obj.addArrayObserver(this);
            }
        }

    }).create(),

    _setup_observers: function() {
        var observer = this.get('storage_volume');
        this.forEach(function(req) {
            observer.addObserved(req, req.get('storage_volume'));
        });
    }.observes('[]').on('init'),

    setAffectedParamset: function(ps, affected) {
        this.get('storage_volume').setAffected(ps, affected);
    },


    // dirty: Em.computed.filterBy('@this', 'isDirty', true),
    dirty: function() {
        return this.filterBy('isDirty');
    }.property('@each.isDirty'),
    isDirty: Em.computed.notEmpty('dirty')
});
