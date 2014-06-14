var attr = DS.attr;

App.Level = DS.Model.extend({
    paramSets: DS.hasMany('levelParamSet'),
    name: attr('string'),

    // routineParamSets: Em.computed.filterBy('paramSets', 'service',
    //                                        'routine'),
    // schoolParamSets: Em.computed.filterBy('paramSets', 'service',
    //                                       'school'),
    // siaParamSets: Em.computed.filterBy('paramSets', 'service',
    //                                    'sia'),
    // otherParamSets: Em.computed.filterBy('paramSets', 'service',
    //                                      'other'),

    storage_volume:
    Em.reduceComputed('paramSets.@each.{service,storage_volume_vaccine,storage_volume_diluent,temperature,packing,warm_diluent}',{
        initialValue: [],
        addedItem: function(accum, item, changeMeta, instanceMeta) {
            if (item.get('packing') ==
                App.Enums.packing.PASSIVECOOLED)
            {
                return accum;
            }

            var service = item.get('service'),
                temperature = item.get('temperature'),
                warm_diluent = item.get('warm_diluent'),
                storage_volume = item.get('storage_volume_vaccine') ;

            if (!warm_diluent) {
                storage_volume += item.get('storage_volume_diluent');
            }

            var group = accum.find(function(it) {
                return (it.get('service') == service &&
                        it.get('temperature') == temperature);
            });

            if (Em.isNone(group)) {
                group = Em.Object.create(
                    { service: service,
                      temperature: temperature,
                      storage_volume: 0,
                      items: 0 });
                accum.pushObject(group);
            }

            group.incrementProperty('storage_volume', storage_volume);
            group.incrementProperty('items');

            return accum;
        },
        removedItem: function(accum, item, changeMeta, instanceMeta) {
            if ((changeMeta.previousValues.packing || item.get('packing')) ==
                App.Enums.packing.PASSIVECOOLED)
            {
                return accum;
            }

            var service = changeMeta.previousValues.service
                    || item.get('service'),
                temperature = changeMeta.previousValues.temperature
                    || item.get('temperature'),
                warm_diluent = changeMeta.previousValues.warm_diluent
                    || item.get('warm_diluent'),
                storage_volume =
                    changeMeta.previousValues.storage_volume_vaccine
                    || item.get('storage_volume_vaccine') ;

            if (!warm_diluent) {
                storage_volume +=
                    changeMeta.previousValues.storage_volume_diluent
                    || item.get('storage_volume_diluent');
            }

            var group = accum.find(function(it) {
                return (it.get('service') == service &&
                        it.get('temperature') == temperature);
            });

            if (Em.isNone(group)) return accum;

            group.decrementProperty('storage_volume', storage_volume);
            group.decrementProperty('items');

            if (group.get('items') == 0) {
                // remove group
                accum.removeObject(group);
            }

            return accum;
        }
    })
});

App.Level.Fixtures = [
    { id: 1,
      name: 'Level 1',
      paramSets: [ 1, 6 ] },
    { id: 2,
      name: 'Level 2',
      paramSets: [ 2, 7 ] },
    { id: 3,
      name: 'Level 3',
      paramSets: [ 3, 8 ] },
    { id: 4,
      name: 'Level 4',
      paramSets: [ 4, 9 ] },
    { id: 5,
      name: 'Level 5',
      paramSets: [ 5, 10 ] }
];
