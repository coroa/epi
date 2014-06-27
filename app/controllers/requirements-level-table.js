import Em from 'ember';

import Enums from '../enums';

export default Em.ObjectController.extend({
    needs: ['levels'],
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
    resultTableHead: [{label: 'Net storage volume'}]
            .concat(Enums.temperature.options.map(function(el) {
                return {label: '@ ' + el.label};
            })),
    resultTableLines: function() {
        var _this = this;
        return this.get('controllers.levels').map(function(lvl) {
            return {label: lvl.get('name'),
                    content: lvl.get('storage_volume')
                    .filterBy('service', _this.get('id'))
                    .mapBy('storage_volume')};
        });
    }.property('controllers.levels.@each.{name,storage_volume}')
});


