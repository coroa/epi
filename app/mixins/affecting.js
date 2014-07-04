import Ember from 'ember';

export default Ember.Mixin.create({
    paramset: null,
    requirement: null,

    focusIn: function() {
        if (this.get('paramset') || this.get('requirement')) {
            this.sendAction('action', this.get('paramset'),
                            this.get('requirement'), true);
        }
    },

    focusOut: function() {
        if (this.get('paramset') || this.get('requirement')) {
            this.sendAction('action', this.get('paramset'),
                            this.get('requirement'), false);
        }
    }
});
