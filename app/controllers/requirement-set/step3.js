import Ember from 'ember';
import Enums from '../../enums';

export default Ember.Controller.extend({
    needs: ['requirements', 'facilities', 'levels'],

    /**
     * `temperatureChoices` lists the available temperatures, defined
     * in the temperature Enum. Used by the temperature select box.
     *
     * @property temperatureChoices
     * @type Array of mainly { id: <id>, label: <label> }
     */
    temperatureChoices: Enums.temperature.options,

    /**
     * `temperature` is bound to the temperature select box.
     *
     * @property freqTemperature
     * @type Enum from Enums.temperature
     * @default Enums.temperature.PLUS5
     */
    temperature: Enums.temperature.PLUS5,

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

    /**
     * finds the controller associated with the top-level country
     *
     * @property country
     * @type FacilityController
     * @default Facility on level with id 1
     */
    country: function() {
        return this.get('controllers.facilities').findBy('level.id', '1');
    }.property('controllers.facilities.@each.level'),


    /**
     * `detailedFacility` is a property, which makes a panel with
     * detailed information on the equipment in a facilty appear, when
     * set. A value of `null` hides the panel.
     *
     * @property detailedFacility
     * @type FacilityController|null
     * @default null
     */
    detailedFacility: null,

    /**
     * `levelChoices` lists the levels, which the level select box of
     * the temperature should show. As the frequency chart only means
     * to show descendants of the facility in `selected`, only levels
     * below that of `selected` are included.
     *
     * @property levelChoices
     * @type Array of Level
     * @default Levels below the one of `selected.level`
     */
    levelChoices: function() {
        var levels = this.get('controllers.levels').mapBy('model'),
            index = levels.indexOf(this.get('selected.level'));
        if (index !== -1) {
            return levels.slice(index + 1);
        } else {
            return levels;
        }
    }.property('controllers.levels.[]', 'selected'),

    /**
     * `freqLevel` is bound to the level select box for the frequency
     * chart.
     *
     * Whenever the `selected` facility changes, it assumes the level
     * `selected.level` + 2.
     *
     * @property freqLevel
     * @type Level (Model of)
     */
    freqLevel: function(key, value) {
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
