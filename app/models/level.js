import DS from 'ember-data';
import Em from 'ember';

var attr = DS.attr;

var Level = DS.Model.extend({
    paramsets: DS.hasMany('level-paramset', {inverse: 'level'}),
    name: attr('string'),

    storage_volume:
    Em.reduceComputed('paramsets.@each.{service,storage_volume,temperature,warm_diluent}',{
        initialValue: null,
        addedItem: function(accum, item, changeMeta, instanceMeta) {
            if (Ember.isNone(accum)) { accum = []; }

            var service = item.get('service'),
                temperature = item.get('temperature'),
                storage_volume = item.get('storage_volume') ;

            if (storage_volume === 0 || isNaN(storage_volume)) {
                return accum;
            }

            var group = accum.find(function(it) {
                return (it.get('service') === service &&
                        it.get('temperature') === temperature);
            });

            if (Em.isNone(group)) {
                group = Em.Object.create(
                    { service: service,
                      temperature: temperature,
                      storage_volume: 0,
                      items: [] });
                accum.pushObject(group);
            }

            group.incrementProperty('storage_volume', storage_volume);
            group.get('items').pushObject(item);

            this.notifyPropertyChange('storage_volume');
            return accum;
        },
        removedItem: function(accum, item, changeMeta, instanceMeta) {
            if (Ember.isNone(accum)) { accum = []; }

            if (Ember.isNone(changeMeta.previousValues)) {
                return accum;
            }

            var service = changeMeta.previousValues.service ||
                    item.get('service'),
                temperature = changeMeta.previousValues.temperature ||
                    item.get('temperature'),
                storage_volume =
                    changeMeta.previousValues.storage_volume ||
                    item.get('storage_volume') ;

            if (storage_volume === 0 || isNaN(storage_volume)) { return accum; }

            var group = accum.find(function(it) {
                return (it.get('service') === service &&
                        it.get('temperature') === temperature);
            });

            if (Em.isNone(group)) { return accum; }

            group.decrementProperty('storage_volume', storage_volume);

            var items = group.get('items');
            items.removeObject(item);

            if (Ember.isEmpty(items)) {
                // remove group
                accum.removeObject(group);
            }

            this.notifyPropertyChange('storage_volume');
            return accum;
        }
    })
});

export default Level;
