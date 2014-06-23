import Ember from 'ember';

export default Ember.ArrayController.extend({
    itemController: 'level-paramset',

    // dirty: Ember.computed.filterBy('@each', 'isDirty', true),
    dirty: function() {
        return this.filterBy('isDirty');
    }.property('@each.isDirty'),
    isDirty: Ember.computed.notEmpty('dirty')
});
