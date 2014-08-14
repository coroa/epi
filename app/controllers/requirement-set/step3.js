import Ember from 'ember';
import Enums from '../../enums';

export default Ember.Controller.extend({
    selectedChildren: Ember.computed.oneWay('selected.wrappedChildren'),
    needs: ['requirements', 'facilities', 'levels'],
    selectedAsArray: function() {
        return this.get('selected') ? [ this.get('selected') ] : null;
    }.property('selected'),
    selected: Ember.computed.oneWay('country'),
    country: function() {
        return this.get('controllers.facilities').findBy('level.id', '1');
    }.property('controllers.facilities.@each.level'),

    temperatureChoices: Enums.temperature.options,
    levelChoices: function() {
        var levels = this.get('controllers.levels').mapBy('model'),
            index = levels.indexOf(this.get('selected.level'));
        if (index !== -1) {
            return levels.slice(index + 1);
        } else {
            return levels;
        }
    }.property('controllers.levels', 'selected'),
    subTemperature: Enums.temperature.MINUS25,
    subLevel: function(key, value) {
        if (arguments.length > 1) {
            return value;
        }
        var levels = this.get('controllers.levels').mapBy('model'),
            index = levels.indexOf(this.get('selected.level'));
        if (index !== -1) {
            return levels.objectAt(Math.min(index + 2, levels.get('length')-1));
        } else {
            return null;
        }
    }.property('selected', 'controllers.levels.[]')
});
