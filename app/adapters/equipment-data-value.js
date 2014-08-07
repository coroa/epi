import Em from 'ember';
import DHISBaseAdapter from './dhis-base';

export default DHISBaseAdapter.extend({
    buildURL: function() {return this.baseURL + "/dataValues";},
    parseQueryFromId: function(id) {
        Em.assert('id must not be undefined', !Em.isNone(id));
        var params = id.split(':');
        return { pe: params[0], ou: params[1], de: params[2] };
    },
    find: function(store, type, id) {
        return this.ajax(this.buildURL(), 'GET', {
            data: this.parseQueryFromId(id)
        }).then(function(json) {
            return {id: id,
                    value: json[0]};
        });
    }
});
