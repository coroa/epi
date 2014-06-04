App.RequirementController = Ember.ObjectController.extend({
    needs: ['requirements'],
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
