import DS from 'ember-data';
import Em from 'ember';

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
        var serializer = this;
        return arrayPayload.map(function(singlePayload) {
            return serializer.extractSingle(store, type, singlePayload);
        });
    }
});
