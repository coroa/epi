App.Step1Controller = Ember.Controller.extend({
    needs: ["requirements", "vaccines"],
    actions: {
        createRequirement: function(service, vaccineId) {
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
        }
    }
});
