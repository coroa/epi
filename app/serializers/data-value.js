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
    extractFindAll: function(store, type, payload) {
        var records = this.extractArray(store, type, payload),
            includedIds = records.mapBy('id'),
            pe = payload.metaData.pe,
            ou = payload.metaData.ou,
            de = this.dhis.getDEs(),
            i, i_length, j, j_length, k, k_length, id;
        // add the rest of the data
        for(i=0, i_length=pe.length; i<i_length; i++) {
            for(j=0, j_length=ou.length; j<j_length; j++) {
                for (k=0, k_length=de.length; k<k_length; k++) {
                    id = this.dhis.buildIdFromQuery(pe[i], ou[j], de[k]);
                    if (! includedIds.contains(id)) {
                        records.push({ id: id, value: null });
                    }
                }
            }
        }

        return records;
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
