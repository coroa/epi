import Ember from 'ember';

export default Ember.Route.extend({
    redirect: function() {
        window.location.replace("http://localhost:4200/");
    },
    beforeModel: function() {
        var adapter = Ember.lookup.lookup("adapter:application");
        adapter.resetData();
    }
});
