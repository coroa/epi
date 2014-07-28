import Em from 'ember';

export default Em.ObjectController.extend({
    needs: ['requirements', 'vaccines', 'levels'],

    vaccineInitials: Em.computed.oneWay('vaccine.initials'),
    vaccines: function() {
        return this.get('controllers.vaccines')
            .filterBy('initials', this.get('vaccineInitials'));
    }.property('vaccineInitials',
               'controllers.vaccines.@each.initials'),

    storage_volume: Em.computed.map(null, function(ps) {
        var service = this.get('service'),
            vaccine = this.get('vaccine');
        // console.log('updating storage_volume of',
        //             Enums.service.options[service].word,
        //             'requirement', vaccine.get('initials'), 'to',
        //             ps.get('storage_volume'));
        // console.log('are there observers? ',
        //             this.get('storage_volume.hasArrayObservers') ?
        //             'yes' : 'no');
        // console.log('updating storage_volume on requirement model with'
        //             + ' level', ps.get('level'), 'of name', ps.get('level.name'));
        if (! ps.get('level.isLoaded')) {
            return Em.Object.create();
        }

        return Em.Object.create(
            { level: ps.get('level'),
              temperature: ps.get('temperature'),
              service: service,
              vaccine: vaccine,
              storage_volume: ps.get('storage_volume'),
              requirementId: this.get('id'),
              paramsetId: ps.get('id') });
    }).property('levelParamsets.@each.{temperature,storage_volume,level}',
                'service', 'vaccine', 'levelParamsets.[]',
                'controllers.levels.[]'), // set the dependent key omitted earlier

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
