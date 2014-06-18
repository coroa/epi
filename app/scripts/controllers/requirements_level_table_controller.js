App.RequirementsLevelTableController = Em.ObjectController.extend({
    temperatures: App.Enums.temperature.options.map(function(item, index) {
        return { id: index, label: item.label };
    }),
    packings: App.Enums.packing.options.map(function(item, index) {
        return { id: index, label: item.label };
    }),
    tableLines: function() {
        return Array.prototype.concat
            .apply([], this.get('requirements').map(function(req) {
                console.log('looping');
                var vaccine = req.get('vaccine'),
                    length = req.get('levelParamsets.length');
                return req.get('levelParamsets').map(function(p, id) {
                    return { showVaccine: id == 0,
                             numberOfLevels: length,
                             vaccine: vaccine,
                             paramset: p };
                });
            }));
    }.property('requirements.@each')
});
