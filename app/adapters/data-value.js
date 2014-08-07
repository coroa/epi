import Em from 'ember';
import DHISBaseAdapter from './dhis-base';

import DHIS from '../utils/dhis';

export default DHISBaseAdapter.extend({
    buildURL: function() {return DHIS.baseURL + "/analytics";},
    find: function(store, type, id) {
        return this.ajax(this.buildURL(), 'GET', {
            data: DHIS.buildQueryFromId(id)
        });
    },
    findMany: function(store, type, ids) {
        var query = {pe: [], ou: [], de: []},
            fields = ['pe', 'ou', 'de'];
        ids.forEach(function(id) {
            var q = DHIS.parseId(id);
            fields.forEach(function(field) {
                query[field].addObject(q[field]);
            });
        });
        fields.forEach(function(field) {
            query[field] = query[field].join(';');
        });
        return this.ajax(this.buildURL(), 'GET',
                         { data: DHIS.buildQuery(query) })
            .then(function(json) {
                return { ids: ids, data: json };
            });
    },
    findAll: function(store, type) {
        var no_level = store.all('level').get('length'),
            levels = [],
            periods = DHIS.getPeriods(),
            DEs = DHIS.getDEs();
        for (var i=1; i<=no_level; i++) { levels.push('LEVEL-' + i); }
        return this.ajax(this.buildURL(), 'GET',
                         { data: DHIS.buildQuery(periods.join(';'),
                                                 levels.join(';'),
                                                 DEs.join(';')) });
    }
});
