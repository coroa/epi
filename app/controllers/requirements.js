import Em from 'ember';
import Enums from '../enums';
import AffectedArrayMerger from '../utils/affected-array-merger';
import fallback from '../utils/fallback';

var requirementTableCell = Em.Object.extend({
        value2: Em.computed.alias('value')
    }),
    amendableRequirementTableCell = Em.Object.extend({
        value2: fallback('_amendObj.storage_volume', 'value'),
        isCustom: Em.computed.notEmpty('_amendObj.storage_volume')
    }),

    make_array = function(n, amends, no_of_sia) {
        var a = [],
            baseObj = (amends == null
                       ? requirementTableCell
                       : amendableRequirementTableCell);

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

    storage_volume: function() {
        return AffectedArrayMerger.create({
            _replace_nan: function(item) {
                if (isNaN(Ember.get(item, 'storage_volume'))) {
                    console.log('Replacing NaN by 0 in storage_volume');
                    Ember.set(item, 'storage_volume', 0);
                }
            },
            mapFn: [ '_replace_nan' ],
            topArray: this,
            elementPath: 'storage_volume'
        });
    }.property(),

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
                    Em.set(siaObj, 'value', value);
                    Em.set(siaObj, 'isAffected', f('isAffected'));
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
                    Em.set(siaObj, 'value', 0);
                    Em.set(siaObj, 'isAffected', false);
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
