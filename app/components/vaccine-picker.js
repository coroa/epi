import Ember from 'ember';
import AffectingMixin from '../mixins/affecting';

export default Ember.Component.extend(AffectingMixin, {
    classNames: ['dropdown', 'vaccine-picker'],
    vaccines: [], // typically bound when used
    vaccine: null, // -"-
    generics: Ember.computed.filterBy('vaccines', 'type', 'generic'),
    products: Ember.computed.filterBy('vaccines', 'type', 'product'),
    actions: {
        choose: function(vaccine) {
            this.set('vaccine', vaccine);
        }
    }
});
