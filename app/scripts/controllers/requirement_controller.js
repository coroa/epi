App.RequirementController = Ember.ObjectController.extend({
    needs: ['requirements', 'vaccines'],
    presentation_disabled: function() {
        return this.get('vaccine_initials') === undefined;
    }.property('vaccine_initials'),
    forms_disabled: function() {
        return this.get('vaccine_initials') == undefined ||
            this.get('vaccine_id') == undefined;
    }.property('vaccine_initials', 'vaccine_id'),
    update_vaccine: function() {
        if (this.get('vaccine_id') !== undefined) {
            var _ = this;
            this.store.find('vaccine',
                            this.get('vaccine_id')).then(function(x) {
                                _.set("vaccine", x); });
        }
    }.observes('vaccine.id'),
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
               'controllers.requirements.@each.type')
});
