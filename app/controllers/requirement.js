import Em from 'ember';

export default Em.ObjectController.extend({
    needs: ['requirements', 'vaccines', 'levels'],

    vaccineInitials: Em.computed.oneWay('vaccine.initials'),
    vaccines: function() {
        return this.get('controllers.vaccines')
            .filterBy('initials', this.get('vaccineInitials'));
    }.property('vaccineInitials',
               'controllers.vaccines.@each.initials'),


    storage_volume: function() {
        var service = this.get('service'),
            vaccine = this.get('vaccine'),
            requirementId = this.get('id');

        // console.log('are there observers for me? ',
        //             this.get('storage_volume.hasArrayObservers') ?
        //             'yes' : 'no');

        return this.get('levelParamsets').map(function(ps) {
            // console.log('updating storage_volume of',
            //             Enums.service.options[service].word,
            //             'requirement', vaccine.get('initials'), 'to',
            //             ps.get('storage_volume'));
            console.log('am i observing the storage volumes on the'
                        + ' levelParamset? ',
                        ps.hasObserverFor('storage_volume') ? 'yes' : 'no');
            // console.log('updating storage_volume on requirement model with'
            //             + ' level', ps.get('level'), 'of name', ps.get('level.name'));

            return Em.Object.create(
                { level: ps.get('level'),
                  temperature: ps.get('temperature'),
                  service: service,
                  vaccine: vaccine,
                  storage_volume: ps.get('storage_volume'),
                  requirementId: requirementId,
                  paramsetId: ps.get('id') });
        });
    }.property('levelParamsets.@each.{temperature,storage_volume,level}',
               'service', 'vaccine',
               'controllers.levels.[]'), // set the dependent key omitted earlier

    // storage_volume: Em.computed.map('levelParamsets.@each.{temperature,storage_volume,level}', function(ps) {
    //     var service = this.get('service'),
    //         vaccine = this.get('vaccine');
    //     // console.log('updating storage_volume of',
    //     //             Enums.service.options[service].word,
    //     //             'requirement', vaccine.get('initials'), 'to',
    //     //             ps.get('storage_volume'));
    //     console.log('are there observers for me? ',
    //                 this.get('storage_volume.hasArrayObservers') ?
    //                 'yes' : 'no');
    //     console.log('am i observing the storage volumes on the'
    //                 + ' levelParamset? ',
    //                 ps.hasObserverFor('storage_volume') ? 'yes' : 'no');
    //     // console.log('updating storage_volume on requirement model with'
    //     //             + ' level', ps.get('level'), 'of name', ps.get('level.name'));
    //     if (! ps.get('level.isLoaded')) {
    //         debugger;
    //         return Em.Object.create();
    //     }

    //     return Em.Object.create(
    //         { level: ps.get('level'),
    //           temperature: ps.get('temperature'),
    //           service: service,
    //           vaccine: vaccine,
    //           storage_volume: ps.get('storage_volume'),
    //           requirementId: this.get('id'),
    //           paramsetId: ps.get('id') });
    // }).property('levelParamsets.@each.{temperature,storage_volume,level}',
    //             'service', 'vaccine',
    //             'controllers.levels.[]',
    //             'levelParamsets.[]'), // set the dependent key omitted earlier

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
            this.send('removeRequirement', this);
        },
        'reset': function(field) {
            this.set(field, null);
        }
    },

    /**
     * The dirty models of this requirement and level-paramsets
     *
     * @property dirty
     * @type {Array of DS.model}
     */
    dirty: function() {
        var models = [];
        if (this.get('isDirty')) { models.push(this.get('model')); }
        return models.concat(this.get('levelParamsets')
                             .filterBy('isDirty'));
    }.property('isDirty', 'levelParamsets.@each.isDirty')
});
