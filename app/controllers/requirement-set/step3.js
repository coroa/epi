import Ember from 'ember';


export default Ember.Controller.extend({
    needs: ['requirements', 'facilities'],
    selectedChildren: Ember.computed.oneWay('selected.wrappedChildren'),
    selectedAsArray: function() {
        return this.get('selected') ? [ this.get('selected') ] : null;
    }.property('selected'),
    selected: Ember.computed.oneWay('country'),
    country: function() {
        return this.get('controllers.facilities').findBy('level.id', '1');
    }.property('controllers.facilities.@each.level')
});
