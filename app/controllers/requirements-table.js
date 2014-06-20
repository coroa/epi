import Em from 'ember';

export default Em.ObjectController.extend({
    needs: ['vaccines', 'requirements'],
    vaccineInitials: null,
    vaccineId: null,
    vaccines: function() {
        return this.get('controllers.vaccines')
            .filterBy('initials', this.get('vaccineInitials'));
    }.property('vaccineInitials',
               'controllers.vaccines.@each.initials'),
    createRequirement: function() {
        var service = this.get('id'),
            vaccineId = this.get('vaccineId'),
            store = this.get('controllers.vaccines').store;
        if(Em.isEmpty(vaccineId)) { return; }

        store.find('vaccine', vaccineId)
            .then(function(vaccine) {
                return store
                    .createRecord('requirement',
                                  { service: service,
                                    vaccine: vaccine })
                    .save();
                // Em.run.scheduleOnce('afterRender', _this,
                //                     function(req) {
                //                         // debugger;
                //                     }, req);
            })
            .then(function(requirement) {
            });

        // this.get('controllers.requirements').store
        //     .createRecord('requirement', { 'service': service,
        //                                    'vaccine': vaccineId });
        // perhaps we want to focus it as well?

        this.set('vaccineInitials', null);
        this.set('vaccineId', null);
    }.observes('vaccineId')
});
