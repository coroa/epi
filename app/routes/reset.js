import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel: function() {
        var adapter = lookup("adapter:application");
        adapter.resetData();
    }
});
