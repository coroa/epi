import Ember from 'ember';

export default Ember.ArrayController.extend({
    itemController: 'facility',
    maxValue: function() {
        return Math.max.apply(this, [0].concat(this.mapBy('maxValue')));
    }.property('@each.maxValue')
});
