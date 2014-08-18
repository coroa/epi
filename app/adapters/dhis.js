import Em from 'ember';
import DS from 'ember-data';
import AjaxHelperMixin from '../mixins/ajax-helper';

export default DS.Adapter.extend(AjaxHelperMixin, {
    buildURL: function(type, id) {
        var adapter = this;
        return this.dhis.baseURL.then(function(baseURL) {
            var url = [ baseURL, adapter.dhis.getPathFor(type) ];
            if (id) { url.push(id); }
            return url.join('/');
        });
    },
    findAll: function(store, type, sinceToken) {
        var adapter = this, query;

        if (sinceToken) {
          query = { since: sinceToken };
        }

        console.log('findAll for', type.typeKey);
        return adapter.buildURL(type.typeKey)
            .then(function(url) {
                return adapter.ajax(url, 'GET', { data: query });
            }) ;
    },
    findQuery: function(store, type, query) {
        var adapter = this;
        return adapter.buildURL(type.typeKey)
            .then(function(url) {
                return adapter.ajax(url, 'GET', { data: query });
            });
    },
    find: function(store, type, id) {
        var adapter = this;
        return adapter.buildURL(type.typeKey, id)
            .then(function(url) {
                return adapter.ajax(url, 'GET');
            });
    }
});
