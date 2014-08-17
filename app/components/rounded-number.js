import Ember from 'ember';

export default Ember.Component.extend({
    content: 0,
    digits: 2,
    roundedNumber: function() {
        var factor = Math.pow(10, this.get('digits'));
        return Math.round(this.get('content') * factor) / factor;
    }.property('content')
});
