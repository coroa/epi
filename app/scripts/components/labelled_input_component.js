App.VaccineTableComponent = Ember.Component.extend({
    
    actions: {
        reset: function() {
            this.set('value', this.get('default'));
        }
    }
});

// Ember.Handlebars.helper('labelled-input', App.LabelledInputComponent);
