import DS from 'ember-data';
import Enums from '../enums';

var attr = DS.attr;

var LevelParamset = DS.Model.extend({
    requirement: DS.belongsTo('requirement'),
    level: DS.belongsTo('level'),
    temperature: attr('number',
                      { defaultValue: Enums.temperature.MINUS25 }),
    warm_diluent: attr('boolean'),
    packing: attr('number',
                  { defaultValue: Enums.packing.SECONDARY }),
    safety_stock: attr('number'),
    reorder_freq: attr('number'),

    service: function() {
        return this.get('requirement.service');
    }.property('requirement.service'),

    supply_interval: function(key, value, prevValue) {
        if (arguments.length > 1) {
            if (value <= 0) { return prevValue; }
            this.set('reorder_freq', 52.0/value);
            return value;
        }

        return (52.0 / this.get('reorder_freq'));
    }.property('reorder_freq'),

    storage_volume_vaccine: function() {
        return this.get('requirement.vaccine_volume_per_course') *
            Enums.packing.options[this.get('packing')].factor *
            (1 + this.get('safety_stock') / 100) *
            (1 / this.get('reorder_freq'));
    }.property('requirement.vaccine_volume_per_course',
               'packing', 'safety_stock', 'reorder_freq'),

    storage_volume_diluent: function() {
        return this.get('requirement.diluent_volume_per_course') *
            Enums.packing.options[this.get('packing')].factor *
            (1 + this.get('safety_stock') / 100) *
            (1 / this.get('reorder_freq'));
    }.property('requirement.diluent_volume_per_course',
               'packing', 'safety_stock', 'reorder_freq'),

    storage_volume: function() {
        return this.get('storage_volume_vaccine') +
            (!this.get('warm_diluent')) *
            this.get('storage_volume_diluent');
    }.property('storage_volume_vaccine', 'storage_volume_diluent',
               'warm_diluent'),

    storage_volume_per_1000: function() {
        return this.get('storage_volume') * 1000;
    }.property('storage_volume')
});

LevelParamset.reopenClass({
    FIXTURES: [
        { id: 1,
          requirement: 1,
          level: 1,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        },
        { id: 2,
          requirement: 1,
          level: 2,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        },
        { id: 3,
          requirement: 1,
          level: 3,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        },
        { id: 4,
          requirement: 1,
          level: 4,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        },
        { id: 5,
          requirement: 1,
          level: 5,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        },
        { id: 6,
          requirement: 2,
          level: 1,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        },
        { id: 7,
          requirement: 2,
          level: 2,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        },
        { id: 8,
          requirement: 2,
          level: 3,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        },
        { id: 9,
          requirement: 2,
          level: 4,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        },
        { id: 10,
          requirement: 2,
          level: 5,
          temperature: 0,
          warm_diluent: false,
          packing: 1,
          safety_stock: 25,
          reorder_freq: 4
        }]
});

export default LevelParamset;
