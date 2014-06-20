import Ember from 'ember';

export default Ember.View.extend({
    classNames: ['footer'],
    // attributeBindings: ['id'],
    classNameBindings: ['controller.footerCollapsed']
});
