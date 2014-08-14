import Ember from 'ember';

export default Ember.Route.extend({
    redirect: function() {
        var location = window.location,
            url = location.protocol + '//' + location.host + location.pathname;
        location.replace(url);
    },
    beforeModel: function() {
        var adapter = Ember.lookup.lookup("adapter:application");
        adapter.resetData();
    }
});
