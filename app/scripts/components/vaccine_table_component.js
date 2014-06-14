App.VaccineTableComponent = Ember.Component.extend({
    // wants to have vaccines and service
    vaccineInitials: null,
    vaccineId: null,
    vaccinesFiltered: function() {
        return this.get('vaccines')
            .filterBy('initials', this.get('vaccineInitials'));
    }.property('vaccineInitials',
               'vaccines.@each.initials'),

    vaccine_chosen: function() {
        var id = this.get('vaccineId');
        if (!Em.isNone(id)) {
            console.log("sending action: " + this.get('service.id') +
                        ", " + id);
            this.sendAction('action', this.get('service.id'), id);
            this.set('vaccineId', null);
            this.set('vaccineInitials', null);
        };
    }.observes('vaccineId')
});

// Ember.Handlebars.helper('labelled-input', App.LabelledInputComponent);
