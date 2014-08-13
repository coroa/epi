import Ember from 'ember';

export default Ember.Mixin.create({
    // dirty: Ember.computed.filterBy('@each', 'isDirty', true),
    dirty: function() {
        var models = this.filterBy('isDirty');
        if (Ember.isNone(this.itemController)) {
            return models;
        } else {
            return models.mapBy('model');
        }
    }.property('@each.isDirty'),
    isDirty: Ember.computed.notEmpty('dirty')
});
