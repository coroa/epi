import DHISAdapter from './dhis';

export default DHISAdapter.extend({
    ajax: function(url, type, hash) {
        if (type === 'GET') {
            hash = hash || {};
            var query;
            if ('data' in hash) {
                query = hash['data'];
            } else {
                query = hash['data'] = {};
            }
            query['viewClass'] = 'detail';
        }
        return this._super(url, type, hash);
    }
});
