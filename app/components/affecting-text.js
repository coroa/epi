import Ember from 'ember';

export default Ember.TextField.extend({
    classNames: ['form-control'],
    paramset: null,

    focusIn: function() {
        this.sendAction('action', this.get('paramset'), true);
    },

    focusOut: function() {
        this.sendAction('action', this.get('paramset'), false);
    }
});
