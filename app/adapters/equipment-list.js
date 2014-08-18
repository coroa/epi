import Em from 'ember';
import DS from 'ember-data';
import AjaxHelperMixin from '../mixins/ajax-helper';

export default DS.Adapter.extend(AjaxHelperMixin, {
    find: function(store, type, id) {
        var adapter = this;
        return this.dhis.baseURL.then(function(baseURL) {
            var url = baseURL + "/" + adapter.dhis.getPathFor(type.typeKey);
            return adapter.ajax(url, 'GET', {
                data: { ou: id }
            });
        })
        // mockup for the situation, where the equipments endpoint is
        // not defined.
            .then(null, function() {
                return Em.RSVP.resolve({"equipments":[{"name":"Lac 69 : REF : Solar + Solar : ","created":"2014-01-30T10:53:22.000+0000","lastUpdated":"2014-01-30T10:53:22.000+0000","href":"http://212.71.248.145:8080/ccei_laos/api/equipments/eBggviKoboK","id":"eBggviKoboK"},{"name":"Lac 69 : REF : Solar + Solar : ","created":"2014-01-30T10:53:22.000+0000","lastUpdated":"2014-01-30T10:53:22.000+0000","href":"http://212.71.248.145:8080/ccei_laos/api/equipments/a2t4cw400hx","id":"a2t4cw400hx"}]});
            });

    }
});
