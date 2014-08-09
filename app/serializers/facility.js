import DHISSerializer from './dhis';

export default DHISSerializer.extend({
    extractSingle: function(store, type, payload) {
        if ('children' in payload) {
            payload['children'] = payload['children'].mapBy('id');
        }
        return this._super(store, type, payload);
    }
});
