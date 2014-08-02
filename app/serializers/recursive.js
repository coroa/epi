import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONSerializer.extend({
    serializeHasMany: function(record, json, relationship) {
        var serializer = this,
            key = relationship.key,
            hasManyRecords = Ember.get(record, key);

        if (hasManyRecords
            && relationship.options.embedded == 'onsave')
        {
            json[key] = hasManyRecords.map(function(item){
                return serializer.serialize(item);
            });
        } else {
            this._super(record, json, relationship);
        }
    },
    serializeBelongsTo: function(record, json, relationship) {
        var serializer = this,
            key = relationship.key,
            belongsToRecord = Ember.get(record, key);

        if (relationship.options.embedded === 'onsave')
        {
            json[key] = serializer.serialize(belongsToRecord);
        } else if (relationship.options.embedded === 'drop') {
            delete json[key];
        } else {
            this._super(record, json, relationship);
        }
    }
});
