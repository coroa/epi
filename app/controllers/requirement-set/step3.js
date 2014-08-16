import Ember from 'ember';
import Enums from '../../enums';

export default Ember.Controller.extend({
    needs: ['requirements', 'facilities', 'levels'],


    /**
     * `selectedAsArray` wraps the selected facility into an array, so
     * it can be fed into a surplus-chart. This shows the left of the
     * two clustered bar charts.
     *
     * @property selectedAsArray
     * @type Array of FacilityController
     */
    selectedAsArray: function() {
        return this.get('selected') ? [ this.get('selected') ] : null;
    }.property('selected'),

    /**
     * `selectedChildren` holds a list of the facilities, which are
     * children of the selected. They are shown in the right of the
     * two clustered bar plots, surplus-chart.
     *
     * @property selectedChildren
     * @type Array of FacilityController
     */
    selectedChildren: Ember.computed.oneWay('selected.wrappedChildren'),

    /**
     * `selected` is bound to the facility tree on the left. And
     * controls on which facility the focus of the step3 should be.
     *
     * @property selected
     * @type FacilityController
     * @default facility with level.id=1
     */
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
        if (index !== -1 && index !== levels.get('length') - 1) {
            return levels.objectAt(Math.min(index + 2, levels.get('length')-1));
        } else {
            return null;
        }
    }.property('selected', 'controllers.levels.[]')
});
