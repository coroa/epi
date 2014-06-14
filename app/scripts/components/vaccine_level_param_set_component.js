App.VaccineLevelParamSetComponent = Ember.Component.extend({
    // wants to have vaccine
    tagName: 'tr',
    amIhere: 'hello',
    wrappedLevelParamSets: function() {
        debugger;
        return this.get('vaccine.levelParamSets')
            .map(function(item, index, enumerable) {
                return { numberOfLevels: enumerable.length,
                         level: item,
                         showVaccine: index == 0 }; }, this);
    }.property('vaccine.levelParamSets')
});

// Ember.Handlebars.helper('labelled-input', App.LabelledInputComponent);
