import DS from 'ember-data';
import Em from 'ember';


export default DS.Adapter.extend({
    baseURL: "http://localhost/api",
    headers: {
        Accept: 'application/json'
    },
    ajaxError: function(jqXHR) {
        if (jqXHR && typeof jqXHR === 'object') {
            jqXHR.then = null;
        }

        return jqXHR;
    },
    ajax: function(url, type, hash) {
        var adapter = this;

        return new Em.RSVP.Promise(function(resolve, reject) {
            hash = adapter.ajaxOptions(url, type, hash);
            hash.success = function(json) {
                Em.run(null, resolve, json);
            };
            hash.error = function(jqXHR) {
                Em.run(null, reject, adapter.ajaxError(jqXHR));
            };

            Em.$.ajax(hash);
        }, "DS: DHISAdapter#ajax " + type + " to " + url);
    },
    ajaxOptions: function(url, type, hash) {
        hash = hash || {};
        hash.url = url;
        hash.type = type;
        hash.dataType = 'json';
        hash.context = this;

        if (hash.data && type !== 'GET') {
            hash.contentType = 'application/json; charset=utf-8';
            hash.data = JSON.stringify(hash.data);
        }

        var headers = Em.get(this, 'headers');
        if (headers !== undefined) {
            hash.beforeSend = function (xhr) {
                [].forEach.call(Em.keys(headers), function(key) {
                    xhr.setRequestHeader(key, headers[key]);
                });
            };
        }

        return hash;
    },
    createRecord: function(_, type) {
        Em.assert('createRecord for', type.typeKey, 'not implemented yet', false);
    },
    updateRecord: function(_, type) {
        Em.assert('updateRecord for', type.typeKey, 'not implemented yet', false);
    },
    deleteRecord: function(_, type) {
        Em.assert('deleteRecord for', type.typeKey, 'not implemented yet', false);
    },
    find: function(_, type) {
        Em.assert('find for', type.typeKey, 'not implemented yet', false);
    },
    findAll: function(_, type) {
        Em.assert('findAll for', type.typeKey, 'not implemented yet', false);
    },
    findQuery: function(_, type) {
        Em.assert('findQuery for', type.typeKey, 'not implemented yet', false);
    }
});
