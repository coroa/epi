import Em from 'ember';

import Enums from '../enums';

export default Em.ObjectController.extend({
    needs: ['levels', 'requirements'],
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
    resultTableHead: Em.computed.alias('controllers.requirements.resultTableHead'),
    resultTableLine: function() {
        return this.get('controllers.requirements.resultTable')
            .objectAt(this.get('id'));
    }.property('controllers.requirements.resultTable.[]', 'id'),
    resultTableSIA: function() {
        return this.get('controllers.requirements.siaServiceIds')
            .map(function(_, i) {
                return Em.Object.create({
                    label: 'SIA' + (i+1).toString(),
                    content: this.get('resultTableLine.content')
                        .map(function(col) {
                            return col.get('values').objectAt(i);
                        })});
            }, this);
    }.property('resultTableLine.[]',
               'controllers.requirements.siaServiceIds.[]'),
    isSIA: Em.computed.equal('id', Enums.service.SIA)
});
