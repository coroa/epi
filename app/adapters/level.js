import DHISAdapter from './dhis';

export default DHISAdapter.extend({
    findAllinProcess: {},
    findAll: function(store, type, sinceToken) {
        var findAllinProcess = Em.get(this, 'findAllinProcess'),
            promise = this._super(store, type, sinceToken)
                .finally(function(json) {
                    delete findAllinProcess[type.typeKey];
                });
        Em.set(findAllinProcess, type.typeKey, promise);
        return promise;
    },
    find: function(store, type, id) {
        var adapter = this;
        // We have to either fire a findAll or already know there
        // is one in process and return the right data as soon as
        // it returns
        var findAllinProcess = Em.get(this, 'findAllinProcess');
        if (Em.get(findAllinProcess, type.typeKey) === null) {
            // it's not running, hmm have the store kick it off
            store.find(type.typeKey);
            Em.assert('store.find must put it in findAllinProcess',
                      Em.get(findAllinProcess, type.typeKey) !== null);
        }
        return Em.get(findAllinProcess, type.typeKey)
            .then(function(json) {
                // the level number returned by DHIS is an integer,
                // while Ember uses string ids
                var result = json[adapter.dhis.getPathFor(type.typeKey)]
                        .findBy(Em.get(store.serializerFor(type),'primaryKey'),
                                parseInt(id));
                return result;
            });
    }
});
