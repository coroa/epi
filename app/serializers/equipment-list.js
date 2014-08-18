import DS from 'ember-data';
import Em from 'ember';

export default DS.JSONSerializer.extend({
    extractFind: function(store, type, payload, id) {
        return this.extractSingle(store, type, payload, id);
    },
    extractSingle: function(store, type, payload, id) {
        var path = this.dhis.getPathFor(type.typeKey),
            eqType = store.modelFor('equipment'),
            eqSerializer = store.serializerFor(eqType);

        payload['items'] = Em.getWithDefault(payload, path, [])
            .map(function(equipment) {
                var id = equipment[eqSerializer.primaryKey],
                    rec = eqSerializer.extract(store, eqType, equipment, id, 'single');
                return store.push(eqType, rec);
            });
        delete payload[path];
        payload.id = id;

        return payload;
    }
});
