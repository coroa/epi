import Em from 'ember';
import DHISBaseAdapter from './dhis-base';

import DHIS from '../utils/dhis';

export default DHISBaseAdapter.extend({
    findAllinProcess: {},
    buildURL: function(type, id) {
        var url = [ DHIS.baseURL,
                    DHIS.getPathFor(type) ];
        if (id) { url.push(id); }
        return url.join('/');
    },
    findAll: function(store, type, sinceToken) {
        var query, findAllinProcess = Em.get(this, 'findAllinProcess');

        if (sinceToken) {
          query = { since: sinceToken };
        }

        console.log('findAll for', type.typeKey);
        var promise = this.ajax(this.buildURL(type.typeKey), 'GET',
                                { data: query })
                .then(function(json) {
                    delete findAllinProcess[type.typeKey];
                    return json;
                });
        Em.set(findAllinProcess, type.typeKey, promise);
        return promise;
    },
    findQuery: function(store, type, query) {
        return this.ajax(this.buildURL(type.typeKey), 'GET',
                         { data: query });
    },
    find: function(store, type, id) {
        if (type.typeKey === 'level') {
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
                    var result = json[DHIS.getPathFor(type.typeKey)]
                            .findBy(Em.get(store.serializerFor(type),'primaryKey'),
                                    parseInt(id));
                    return result;
                });
        } else {
            return this.ajax(this.buildURL(type.typeKey, id), 'GET');
        }
    }
});
