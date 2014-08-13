import DHISBaseAdapter from './dhis-base';

export default DHISBaseAdapter.extend({
    buildURL: function() {return this.dhis.baseURL + "/analytics";},
    find: function(store, _, id) {
        return this.ajax(this.buildURL(), 'GET', {
            data: this.dhis.buildQueryFromId(id)
        });
    },
    findMany: function(store, _, ids) {
        var query = {pe: [], ou: [], de: []},
            fields = ['pe', 'ou', 'de'];
        ids.forEach(function(id) {
            var q = this.dhis.parseId(id);
            fields.forEach(function(field) {
                query[field].addObject(q[field]);
            });
        }, this);
        fields.forEach(function(field) {
            query[field] = query[field].join(';');
        });
        return this.ajax(this.buildURL(), 'GET',
                         { data: this.dhis.buildQuery(query) })
            .then(function(json) {
                return { ids: ids, data: json };
            });
    },
    findAll: function(store) {
        var no_level = store.all('level').get('length'),
            levels = [],
            periods = this.dhis.getPeriods(),
            DEs = this.dhis.getDEs();
        for (var i=1; i<=no_level; i++) { levels.push('LEVEL-' + i); }
        return this.ajax(this.buildURL(), 'GET',
                         { data: this.dhis.buildQuery(periods.join(';'),
                                                 levels.join(';'),
                                                 DEs.join(';')) });
    }
});
