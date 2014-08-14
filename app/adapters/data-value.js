import DS from 'ember-data';
import AjaxHelperMixin from '../mixins/ajax-helper';

export default DS.Adapter.extend(AjaxHelperMixin, {
    buildURL: function() {return this.dhis.baseURL.then(function(url) { return url + "/analytics"; });},
    find: function(store, _, id) {
        var adapter = this;
        return this.buildURL().then(function(url) {
            return adapter.ajax(url, 'GET', {
                data: adapter.dhis.buildQueryFromId(id)
            });
        });
    },
    findMany: function(store, _, ids) {
        var adapter = this,
            query = {pe: [], ou: [], de: []},
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
        return this.buildURL()
            .then(function(url) {
                return adapter.ajax(url, 'GET',
                                    { data: adapter.dhis.buildQuery(query)});
            })
            .then(function(json) {
                return { ids: ids, data: json };
            });
    },
    findAll: function(store) {
        var adapter = this,
            no_level = store.all('level').get('length'),
            levels = [],
            periods = this.dhis.getPeriods(),
            DEs = this.dhis.getDEs();
        for (var i=1; i<=no_level; i++) { levels.push('LEVEL-' + i); }
        return this.buildURL().then(function(url) {
            return adapter.ajax(url, 'GET',
                             { data: adapter.dhis.buildQuery(periods.join(';'),
                                                             levels.join(';'),
                                                             DEs.join(';'))});
        });
    }
});
