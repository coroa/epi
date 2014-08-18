import DS from 'ember-data';

export default DS.JSONSerializer.extend({
    extractMeta: function(store, type, payload) {
        if (payload && payload.pager) {
            store.metaForType(type, payload.pager);
            delete payload.pager;
        }
    },
    extractFindAll: function(store, type, payload) {
        return this.extractArray(store, type, payload[this.dhis.getPathFor(type.typeKey)]);
    },
    extractFindQuery: function(store, type, payload) {
        return this.extractArray(store, type, payload[this.dhis.getPathFor(type.typeKey)]);
    },
    extractArray: function(store, type, arrayPayload) {
        return arrayPayload.map(function(singlePayload) {
            return this.extractSingle(store, type, singlePayload);
        }, this);
    }
});
