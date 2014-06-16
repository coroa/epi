App.RequirementsTableController = Em.ObjectController.extend({
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
            vaccineId = this.get('vaccineId');
        if(Em.isEmpty(vaccineId)) return;

        this.get('controllers.vaccines').store
            .find('vaccine', vaccineId)
            .then((function(_this) { return function(vaccine) {
                var req = _this.get('controllers.requirements').store
                        .createRecord('requirement',
                                      { service: service,
                                        vaccine: vaccine });
                Em.run.scheduleOnce('afterRender', _this,
                                    function(req) {
                                        // debugger;
                                    }, req);
            };})(this));
        // this.get('controllers.requirements').store
        //     .createRecord('requirement', { 'service': service,
        //                                    'vaccine': vaccineId });
        // perhaps we want to focus it as well?

        this.set('vaccineInitials', null);
        this.set('vaccineId', null);
    }.observes('vaccineId')
});
