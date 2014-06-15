App.VaccineLevelParamSetComponent = Ember.Component.extend({
    // wants to have a requirement parameter
    tagName: 'tr',
    temperatures: App.Enums.temperature.options.map(function(item, index) {
        return { id: index, label: item.label };
    }),
    packings: App.Enums.packing.options.map(function(item, index) {
        return { id: index, label: item.label };
    }),
    wrappedLevelParamSets: function() {
        return this.get('requirement.levelParamSets')
            .map(function(item, index, enumerable) {
                return { numberOfLevels: enumerable.get('length'),
                         paramset: item,
                         showVaccine: index == 0 }; }, this);
    }.property('requirement.levelParamSets')
});

// Ember.Handlebars.helper('labelled-input', App.LabelledInputComponent);
