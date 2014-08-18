import Em from 'ember';
import DHISSerializer from './dhis';

export default DHISSerializer.extend({
    extractSingle: function(store, type, payload) {
        if ('children' in payload) {
            payload['children'] = payload['children'].mapBy('id');
        }

        var relationships = Em.get(type, 'relationships');
        relationships.get(store.modelFor('data-value'))
            .forEach(function(r) {
                Em.assert('data-value relationships may only be of'
                          + ' kind hasMany', r.kind === 'hasMany');

                var periods = this.dhis.getPeriods(),
                    dataelement = this.dhis.getDEfor(r.name);

                Em.set(payload, r.name,
                       periods.map(function(p) {
                           return this.dhis.buildIdFromQuery(p, payload.id, dataelement);
                       }, this));
            }, this);

        return this._super(store, type, payload);
    }
});
