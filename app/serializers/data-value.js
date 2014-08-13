import DS from 'ember-data';

export default DS.JSONSerializer.extend({
    extractFindMany: function(store, type, payload) {
        var ids = payload["ids"],
            objs = {};
        this.extractArray(store, type, payload["data"])
            .forEach(function(obj) {
                store.push(type, obj);
                objs[obj.id] = obj;
            });
        return ids.map(function(id) { return objs[id] || { id: id }; });
    },
    extractArray: function(store, type, payload) {
        return payload["rows"].map(function(r) {
            return this.normalize(type, r);
        }, this);
    },
    extractSingle: function(store, type, payload) {
        return this.normalize(type, payload["rows"]);
    },
    normalize: function(type, payload) {
        return { id: this.dhis.buildIdFromQuery.apply(this.dhis, payload.slice(0,3)),
                 value: payload[3] };
    }
});
