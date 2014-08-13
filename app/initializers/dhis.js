import Em from 'ember';

export default {
    name: 'dhis',

    initialize: function(container, application) {
        var dhis = Em.Object.create({
            loginForm: "http://localhost/dhis-web-commons/security/login.action",
            baseURL: "http://localhost/api",
            pathForType: {
                level: "organisationUnitLevels",
                facility: "organisationUnits",
                dataElement: "dataElements"
            },
            periods: [ '2013' ],
            dataelements: {
                population: 'drdP9msdeIZ',
                capacity: 'drdP9msdeIZ'
                // capacity: 'qkFwjzfUrmP'
            },
            getPeriods: function() {
                return this.periods;
            },
            getDEfor: function(name) {
                Em.assert('dataelements mapping must be defined for relation name',
                          !Em.isNone(this.dataelements[name]));
                return this.dataelements[name];
            },
            getDEs: function() {
                var des = [];
                for (var de in this.dataelements) {
                    des.push(this.dataelements[de]);
                }
                return des;
            },
            getPathFor: function(type) {
                return this.pathForType[type];
            },
            buildIdFromQuery: function(pe, ou, de) {
                return [pe, ou, de].join(':');
            },
            buildQuery: function(pe, ou, de) {
                if (arguments.length === 1) {
                    pe = arguments[0].pe;
                    ou = arguments[0].ou;
                    de = arguments[0].de;
                }
                return { dimension: [ 'pe:' + pe, 'ou:' + ou, 'dx:' + de ] };
            },
            buildQueryFromId: function(id) {
                return this.buildQuery(this.parseId(id));
            },
            parseId: function(id) {
                Em.assert('id must not be undefined', !Em.isNone(id));
                var params = id.split(':');
                return { pe: params[0], ou: params[1], de: params[2] };
            },
            // parseManifest: function(json) {
            //     var baseUrl = json.activities.dhis.href;
            //     this.set('baseURL', baseUrl + "/api");
            //     this.set('loginForm', baseUrl + "/dhis-web-commons/security/login.action");
            // },
            init: function() {
                var baseUrl = new Em.RSVP.Promise(function(resolve) {
                    Em.$.getJSON("manifest.webapp", resolve);
                }).then(function(manifest) {
                    var baseUrl = manifest.activities.dhis.href;
                    return baseUrl !== "*" ? baseUrl : "http://localhost";
                });
                this.set('baseURL', baseUrl.then(function(url) { return url + '/api'; }));
                this.set('loginForm', baseUrl.then(function(url) { return url + "/dhis-web-commons/security/login.action"; }));
            }
        });

        application.register('dhis:current', dhis,
                             {instantiate: false});
        application.inject('adapter', 'dhis', 'dhis:current');
        application.inject('serializer', 'dhis', 'dhis:current');
        application.inject('route:application', 'dhis', 'dhis:current');
    }
};
