import Ember from 'ember';
import AffectingMixin from '../mixins/affecting';

export default Ember.Component.extend(AffectingMixin, {
    classNames: ['dropdown', 'vaccine-picker'],
    vaccines: [], // typically bound when used
    vaccine: null, // -"-
    generics: Ember.computed.filterBy('vaccines', 'type', 'generic'),
    products: Ember.computed.filterBy('vaccines', 'type', 'product'),

    /**
     * Whether to render the inside of the dropdown. Adjusted by
     * bootstrap calling the onDropdownToggle callback.
     *
     * @property isShown
     * @type Boolean
     * @default false
     */

    isShown: false,
    onDropdownToggle: function(show) {
        this.set('isShown', show);
    },
    _setupDropdownToggleHandler: function() {
        this.$()
            .on('show.bs.dropdown',
                Ember.run.bind(this, this.onDropdownToggle, true))
            .on('hide.bs.dropdown',
                Ember.run.bind(this, this.onDropdownToggle, false));
    }.on('didInsertElement'),

    actions: {
        choose: function(vaccine) {
            this.set('vaccine', vaccine);
        }
    }
});
