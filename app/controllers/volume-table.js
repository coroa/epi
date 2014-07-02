import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['step2'],
    resultTableHead: Ember.computed.alias('controllers.step2.resultTableHead'),
    resultTableLines: Ember.computed.alias('controllers.step2.resultTableLines')
});
