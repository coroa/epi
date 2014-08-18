import DHISSerializer from './dhis';

export default DHISSerializer.extend({
    primaryKey: 'level',
    extractArray: function(store, type, arrayPayload) {
        // we need a deep copy
        arrayPayload = arrayPayload.map(function(p) {
            return Em.$.extend({}, p);
        });
        return this._super(store, type, arrayPayload);
    }
});
