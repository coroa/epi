var make_filter_func = function(X) {
    return function() {
        return this.filterBy('type', X);
    }.property('@each.type');
};

App.RequirementsController = Ember.ArrayController.extend({
    itemController: 'requirement',

    routine: make_filter_func('routine'),
    school: make_filter_func('school'),
    sia: make_filter_func('sia'),

    types: function() {
        return [ { type: 'Routine Immunization',
                   vaccines: this.get('routine') },
                 { type: 'School Immunization',
                   vaccines: this.get('school') },
                 { type: 'S. Immunization A.',
                   vaccines: this.get('sia') } ];
    }.property('routine', 'school', 'sia')
});
