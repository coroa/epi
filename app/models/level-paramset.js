import DS from 'ember-data';
import Enums from '../enums';

var attr = DS.attr;

var LevelParamset = DS.Model.extend({
    requirement: DS.belongsTo('requirement', {embedded:'drop'}),
    level: DS.belongsTo('level'),
    temperature: attr('number',
                      { defaultValue: Enums.temperature.PLUS5 }),
    warm_diluent: attr('boolean'),
    packing: attr('number',
                  { defaultValue: Enums.packing.SECONDARY }),
    safety_stock: attr('number', { defaultValue: null }),
    reorder_freq: attr('number', { defaultValue: 1 }),

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
            (1 + (+this.get('safety_stock')) / 100) *
            (1 / (+this.get('reorder_freq')));
    }.property('requirement.vaccine_volume_per_course',
               'packing', 'safety_stock', 'reorder_freq'),

    storage_volume_diluent: function() {
        return this.get('requirement.diluent_volume_per_course') *
            Enums.packing.options[this.get('packing')].factor *
            (1 + (+this.get('safety_stock')) / 100) *
            (1 / (+this.get('reorder_freq')));
    }.property('requirement.diluent_volume_per_course',
               'packing', 'safety_stock', 'reorder_freq'),

    storage_volume: function() {
        var ret = this.get('storage_volume_vaccine') +
            (!this.get('warm_diluent')) *
            this.get('storage_volume_diluent');
        console.log('updating storage_volume on level-paramset to', ret);
        return ret;
    }.property('storage_volume_vaccine', 'storage_volume_diluent',
               'warm_diluent')
});

export default LevelParamset;
