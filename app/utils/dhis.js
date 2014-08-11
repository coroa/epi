import Em from 'ember';

export default Em.Object.create({
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
    }
});
