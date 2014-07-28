import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['requirements'],
    resultTableHead: Ember.computed.alias('controllers.requirements.resultTableHead'),
    resultTableLines: Ember.computed.alias('controllers.requirements.resultTable')
});
