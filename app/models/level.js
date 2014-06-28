import DS from 'ember-data';
import Em from 'ember';

var attr = DS.attr;

var Level = DS.Model.extend({
    paramsets: DS.hasMany('level-paramset', {inverse: 'level'}),
    name: attr('string'),

    storage_volume: Em.computed.map('paramsets.@each.{temperature,service,vaccine,storage_volume}', function(ps) {
        return Ember.Object.create(
            { level: this.get('name'),
              temperature: ps.get('temperature'),
              service: ps.get('service'),
              vaccine: ps.get('vaccine'),
              storage_volume: ps.get('storage_volume') });
    })
});

export default Level;
