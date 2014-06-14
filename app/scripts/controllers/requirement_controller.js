App.RequirementController = Ember.ObjectController.extend({
    needs: ['requirements', 'vaccines'],
    isFormsDisabled: true,
    vaccineInitials: Em.computed.oneWay('vaccine.initials'),
    vaccines: function() {
        return this.get('controllers.vaccines')
            .filterBy('initials', this.get('vaccineInitials'));
    }.property('vaccineInitials',
               'controllers.vaccines.@each.initials'),

    vaccineId: function(key, value, oldValue) {
        if (arguments.length > 1) {
            // setter

            // there must be a reset functionality for the unchanged
            // parameter values
            this.set('vaccine', this.get('vaccines')
                     .findBy('id', value).get('content'));
            return value;
        }

        return this.get('vaccine.id');
    }.property('vaccine'),

    data: function() {
        var reqs = this.get("controllers.requirements");
        var ret = reqs.map(function(req, index, en) {
            console.log("label: " + req.get("vaccine.name"));
            return { value: req.get("vaccine_schedule_factor"),
                     type: req.get("type"),
                     label: req.get("vaccine.name")};
        });
        console.log(ret);
        return ret;
    }.property('controllers.requirements.@each.vaccine.name',
               'controllers.requirements.@each.vaccine_schedule_factor',
               'controllers.requirements.@each.serviceLabel'),

    actions: {
        'reset': function(field) {
            this.set(field, null);
        }
    }
});
