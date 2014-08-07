import DS from 'ember-data';
import Em from 'ember';

import DHIS from '../utils/dhis';

export default DS.JSONSerializer.extend({
    extractMeta: function(store, type, payload) {
        if (payload && payload.pager) {
            store.metaForType(type, payload.pager);
            delete payload.pager;
        }
    },
    extractArray: function(store, type, payload) {
        var serializer = this,
            arrayPayload = payload[DHIS.getPathFor(type.typeKey)];
        if (type.typeKey === 'level') {
            // we need a deep copy
            arrayPayload = arrayPayload.map(function(p) {
                return Em.$.extend({}, p);
            });
        }
        return arrayPayload.map(function(singlePayload) {
            return serializer.extractSingle(store, type, singlePayload);
        });
    },
    extractSingle: function(store, type, payload) {
        Array.prototype.concat.apply(
            [],
            ['data-value', 'equipment-data-value'].map(function(t) {
                return this.get(store.modelFor(t));
            }, Em.get(type,'relationships')))
            .forEach(function(r) {
                Em.assert('data-value relationships may only be of'
                          + ' kind hasMany', r.kind === 'hasMany');

                var periods = DHIS.getPeriods(),
                    dataelement = DHIS.getDEfor(r.name);

                Em.set(payload, r.name,
                       periods.map(function(p) {
                           return DHIS.buildIdFromQuery(p, payload.id, dataelement);
                       }, this));
            }, this);
        return this._super(store, type, payload);
    }
});
