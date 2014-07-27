import DS from 'ember-data';
import Em from 'ember';

export default DS.JSONSerializer.extend({
    periods: [ '2013' ],
    dataelements: {
        population: 'drdP9msdeIZ',
        capacity: 'qkFwjzfUrmP'
    },
    buildIdFromQuery: function(pe, ou, de) {
        return [pe, ou, de].join(':');
    },
    extractMeta: function(store, type, payload) {
        if (payload && payload.pager) {
            store.metaForType(type, payload.pager);
            delete payload.pager;
        }
    },
    extractArray: function(store, type, payload) {
        var serializer = this,
            arrayPayload = payload[store.adapterFor(type).pathForType[type.typeKey]];
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
        Em.get(type,'relationships')
            .get(store.modelFor('data-value'))
            .forEach(function(r) {
                Em.assert('data-value relationships may only be of'
                          + ' kind hasMany', r.kind === 'hasMany');

                var periods = Em.get(this, 'periods'),
                    dataelement = Em.get(this, 'dataelements')[r.name];

                Em.assert('dataelements mapping must be defined for'
                          + ' relation name', !Em.isNone(dataelement));

                Em.set(payload, r.name,
                       periods.map(function(p) {
                           return this.buildIdFromQuery(p, payload.id, dataelement);
                       }, this));
            }, this);
        return this._super(store, type, payload);
    }
});
