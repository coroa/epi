import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel: function() {
        var adapter = Ember.lookup.lookup("adapter:application");
        adapter.resetData();
    }
});
