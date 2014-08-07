import Ember from 'ember';
import DS from 'ember-data';

var all = Ember.RSVP.all;

export default {
    name: 'record-loader',

    initialize: function() {
        DS.Store.reopen({
            loadRecordFromPayloadRecursively: function(type, payload) {
                type = this.modelFor(type);
                var store = this,
                    serializer = this.container.lookup('serializer:recursive'),
                    hasManyObjects = [],
                    recordJSON = payload;

                payload = serializer.normalize(payload);

                var promises = [];
                type.eachRelationship(function(key, relationship) {
                    var related = recordJSON[key], // The record at this relationship
                        type = relationship.type;  // The model type

                    if (!related) { return; }

                    var retrieve_func = (relationship.options.embedded === 'onsave'
                                         ? store.loadRecordFromPayloadRecursively
                                         : store.find);

                    // One-to-one
                    if (relationship.kind === "belongsTo") {
                        promises.pushObject(
                            retrieve_func.call(store, type, related)
                                .then(function(relatedRecord) {
                                    recordJSON[key] = relatedRecord;
                                }));
                    }
                    // Many
                    else if (relationship.kind === "hasMany") {
                        delete recordJSON[key];
                        promises.pushObject(
                            all(
                                related.map(function(item){
                                    return retrieve_func.call(store, type, item);
                                }))
                                .then(function(records) {
                                    hasManyObjects.push(
                                        {key: key, records: records,
                                         async: relationship.options.async}
                                    );
                                }));
                    }
                });
                return Ember.RSVP.all(promises)
                    .then(function() {
                        var rec = store.createRecord(type, recordJSON);
                        return all(
                            hasManyObjects.map(function(hasMany) {
                                return Ember.RSVP.Promise.cast(rec.get(hasMany.key))
                                    .then(function(x) {
                                        console.log('adding to',
                                                    type.typeKey,
                                                    'records of type',
                                                    hasMany.records[0].type);
                                        x.pushObjects(hasMany.records);
                                    });
                            }))
                            .then(function() {
                                return rec.save();
                            });
                    });
            },

            serializeRecursively: function(record) {
                var serializer = this.container.lookup('serializer:recursive');
                return serializer.serialize(record, {});
            }
        });
    }
};
