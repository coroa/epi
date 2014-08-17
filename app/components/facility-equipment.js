import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['panel', 'panel-default'],
    attributeBindings: [ 'style' ],

    style: function() {
        return this.get('isVisible') ? "display:hidden" : "";
    }.property('isVisible'),

    isVisible: Ember.computed.notEmpty('content'),

    /**
     * `content` holds the FacilityController of which to show the
     * equipment. If it is null, nothing is rendered.
     *
     * @property content
     * @type FacilityController|null
     * @default null
     */
    content: null,
    actions: {
        close: function() {
            this.set('content', null);
        }
    }
});
