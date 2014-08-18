import Ember from 'ember';

/**
 * `AffectingMixin` is used to extend form-based components to fire
 * the default action whenever the input element is entered or
 * exited. As arguments to the event it passes the two properties
 * `paramset` and `requirement` and a flag `true/false` whether the
 * field is getting or losing focus.
 *
 * @class AffectingMixin
 */
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
