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

        /*
         * Referencing the equipments of a facility works in a
         * two-layered approach: Each facility has a one-to-one
         * relationship to a virtual equipment-list, which is
         * referenced by the same id as the facility and is
         * asynchronously loaded. This equipment-list has a hasMany
         * relationship with the actual equipments (on the `items`
         * key)
         */
        payload['equipments'] = payload["id"];

        return this._super(store, type, payload);
    }
});
