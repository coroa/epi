import DS from 'ember-data';
import Em from 'ember';

var attr = DS.attr;

var Level = DS.Model.extend({
    paramsets: DS.hasMany('level-paramset', {inverse: 'level'}),
    name: attr('string'),

    storage_volume: Em.computed.map('paramsets.@each.{temperature,service,'
                                    + 'vaccine,storage_volume}', function(ps) {
        var service = ps.get('service'),
            vaccine = ps.get('vaccine');
        if (service === null) {
            // bug, the alias bindings aren't synced fast enough,
            // workaround: fetch them directly
            service = ps.get('requirement.service');
        }
        if (vaccine === null) {
            // see above
            vaccine = ps.get('requirement.vaccine');
        }
        Em.assert('Storage volume must not be NaN', !isNaN(ps.get('storage_volume')));
        console.log('updating on level, storage_volume:', ps.get('storage_volume'));
        return Em.Object.create(
            { level: this.get('name'),
              temperature: ps.get('temperature'),
              service: service,
              vaccine: vaccine,
              storage_volume: ps.get('storage_volume'),
              requirementId: ps.get('requirement.id'),
              paramsetId: ps.get('id') });
    })
});

export default Level;
