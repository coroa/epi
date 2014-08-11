import Ember from 'ember';

export default Ember.Route.extend({
    redirect: function(model) {
        var store = this.store,
            sets = model.requirementSets,
            set;

        if (sets.get('length') > 0) {
            set = sets.objectAt(0);
        } else {
            set = store.createRecord('requirement-set',
                                     {name: 'Unnamed 1'})
                .save();
        }

        this.transitionTo('requirement-set.index', set);
    }
});
