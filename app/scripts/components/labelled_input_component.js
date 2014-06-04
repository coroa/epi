App.LabelledInputComponent = Ember.Component.extend({
    classNames: ['form-group'],

    init: function() {
        this.set('layoutName',
                 "components/labelled-input-"
                 + (this.get('addon') !== undefined ? 'wA' : 'woA') + '-'
                 + (this.get('isCustom') !== undefined ? 'wC' : 'woC'));
        this._super.apply(this, arguments);
    }
    // layoutName: 'components/labelled-input-woA-woC',
});

Ember.Handlebars.helper('labelled-input', App.LabelledInputComponent);
