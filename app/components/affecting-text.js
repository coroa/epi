import Ember from 'ember';
import AffectingMixin from '../mixins/affecting';

export default Ember.TextField.extend(AffectingMixin, {
    classNames: ['form-control']
});
