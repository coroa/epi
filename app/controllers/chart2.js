import Em from 'ember';
import Enums from '../enums';

export default Em.Controller.extend({
    needs: ['levels'],
    staticDataLabels: true,
    data: function() {
        var levels = this.get('controllers.levels');
        return [].concat.apply([], levels.map(function(level) {
            var level_name = level.get('name'),
                storage_volume = level.get('storage_volume');

            if(Em.isEmpty(storage_volume)) { return []; }

            return storage_volume.map(function(d) {
                var sublabels =
                        d.get('items').mapBy('requirement.vaccine.label'),
                    values =
                        d.get('items').mapBy('storage_volume');
                return { id: d.get('service')+'_'+level_name+'_'+d.get('temperature'),
                         category: Enums.service.options[d.get('service')].label,
                         label: level_name + " - " + Enums.temperature.options[d.get('temperature')].label,
                         sublabels: sublabels,
                         values: values };
            }, this);
        }, this));
    }.property('controllers.levels.@each.storage_volume')
});
