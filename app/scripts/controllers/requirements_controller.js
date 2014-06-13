App.RequirementsController = Ember.ArrayController.extend({
    itemController: 'requirement',
    sortProperties: ['created_at'],

    services: function() {
        return [ { type: 'Routine Immunization',
                   vaccines: this.filterBy('type', 'routine') },
                 { type: 'School Immunization',
                   vaccines: this.filterBy('type', 'school') },
                 { type: 'S. Immunization A.',
                   vaccines: this.filterBy('type', 'sia') },
                 { type: 'Other Immunization',
                   vaccines: this.filterBy('type', 'other') } ];
    }.property('@each.type')
});
