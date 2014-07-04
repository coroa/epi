import Em from 'ember';

export default Em.ObjectController.extend({
    needs: ['requirements', 'vaccines'],

    vaccineInitials: Em.computed.oneWay('vaccine.initials'),
    vaccines: function() {
        return this.get('controllers.vaccines')
            .filterBy('initials', this.get('vaccineInitials'));
    }.property('vaccineInitials',
               'controllers.vaccines.@each.initials'),

    vaccineId: function(key, value) {
        if (arguments.length > 1) {
            // setter
            this.set('vaccine', this.get('vaccines')
                     .findBy('id', value).get('content'));
            return value;
        }

        return this.get('vaccine.id');
    }.property('vaccine'),

    data: function() {
        var reqs = this.get("controllers.requirements");
        var ret = reqs.map(function(req) {
            console.log("label: " + req.get("vaccine.name"));
            return { value: req.get("vaccine_schedule_factor"),
                     type: req.get("type"),
                     label: req.get("vaccine.name")};
        });
        console.log(ret);
        return ret;
    }.property('controllers.requirements.@each.' +
               '{vaccine.name,vaccine_schedule_factor,serviceLabel}'),
    actions: {
        'delete': function() {
            this.get('model').destroyRecord();
        },
        'reset': function(field) {
            this.set(field, null);
        }
    }

});
