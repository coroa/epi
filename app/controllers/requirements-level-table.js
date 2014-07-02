import Em from 'ember';

import Enums from '../enums';

export default Em.ObjectController.extend({
    needs: ['levels', 'step2'],
    temperatures: Enums.temperature.options.map(function(item, index) {
        return { id: index, label: item.label };
    }),
    packings: Enums.packing.options.map(function(item, index) {
        return { id: index, label: item.label };
    }),
    tableLines: function() {
        return Array.prototype.concat
            .apply([], this.get('requirements').map(function(req) {
                var vaccine = req.get('vaccine'),
                    length = req.get('levelParamsets.length');
                return req.get('levelParamsets').map(function(p, id) {
                    return { showVaccine: id === 0,
                             numberOfLevels: length,
                             vaccine: vaccine,
                             paramset: p };
                });
            }));
    }.property('requirements.@each'),
    resultTableHead: Ember.computed.alias('controllers.step2.resultTableHead'),
    resultTableLine: function() {
        return this.get('controllers.step2.resultTableLines')
            .objectAt(this.get('id'));
    }.property('controllers.step2.resultTableLines.[]', 'id')
});
