import Ember from 'ember';

/**
 * Adds the properties `dirty` and `isDirty` to an ArrayController, to
 * access the dirty models present in the Controller.
 *
 * @class DirtyModelMixin
 */
export default Ember.Mixin.create({
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
