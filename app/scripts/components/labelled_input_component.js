App.LabelledInputComponent = Ember.Component.extend({
    classNames: ['form-group'],
    classNameBindings: ['isCustom:has-feedback'],
    labelFor: null,
    isCustom: function() {
        return this.hasOwnProperty('defaultBinding')
            && this.get('value') != this.get('default');
    }.property('value', 'default'),

    init: function() {
        this.set('layoutName',
                 "components/labelled-input-"
                 + (this.get('addon') !== undefined ? 'wA' : 'woA'));
        this._super();
    },
    inputView: Ember.TextField.extend({
        valueBinding: 'parentView.value',
        classNames: ['form-control'],
        init: function() {
            if (this.get('parentView').hasOwnProperty('defaultBinding')) {
                this.set('classNameBindings',
                         ['parentView.isCustom:btn-warning:btn-success']);
            }
            this._super();
        },
        willInsertElement: function() {
            this.set('parentView.labelFor', this.get('elementId'));
        }
    }),

    actions: {
        reset: function() {
            this.set('value', this.get('default'));
        }
    }
});

Ember.Handlebars.helper('labelled-input', App.LabelledInputComponent);
