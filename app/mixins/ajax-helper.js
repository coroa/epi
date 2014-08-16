import Em from 'ember';

export default Em.Mixin.create({
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
        hash.traditional = true;

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
    }
});
