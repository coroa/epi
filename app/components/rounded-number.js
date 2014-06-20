import Ember from 'ember';

export default Ember.Component.extend({
    number: 0,
    digits: 2,
    roundedNumber: function() {
        var factor = Math.pow(10, this.get('digits'));
        return Math.round(this.get('number') * factor) / factor;
    }.property('number')
});
