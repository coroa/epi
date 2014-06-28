import Ember from 'ember';

export default Ember.ArrayController.extend({
    itemController: 'level',

    storage_volume: Ember.ArrayProxy.extend({
        init: function() {
            this.set('content', Ember.A([]));
            this.set('_positions', Ember.A([]));
            this.set('_changequeue', Ember.A([]));
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

                // console.log('Accumulated changed array at', pos.index + ch.start);
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
        addObserved: function(obj) {
            var positions = this.get('_positions'),
                pos = positions.findBy('obj', obj);
            if (pos === undefined) {
                // first time encountering this object, so we grab
                // the latest full copy of it
                var accum = this.get('content'),
                    last = positions.objectAt(positions.length-1)
                        || { index: 0, length: 0 };
                pos = { obj: obj,
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
        this.forEach(function(lvl) {
            observer.addObserved(lvl.get('storage_volume'));
        });
    }.observes('[]').on('init')
});
