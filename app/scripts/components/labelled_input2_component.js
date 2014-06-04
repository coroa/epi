App.LabelledInput2Component = Ember.Component.extend({
    classNames: ['form-group'],

    init: function() {
        this.set('layoutName',
                 "components/labelled-input2-"
                 + (this.get('addon') !== undefined ? 'wA' : 'woA') + '-'
                 + ((this.get('isCustom1') !== undefined &&
                     this.get('isCustom2') !== undefined) ? 'wC' :
                    'woC'));
        this._super.apply(this, arguments);
    }
    // layoutName: 'components/labelled-input-woA-woC',
});

Ember.Handlebars.helper('labelled-input2', App.LabelledInput2Component);
