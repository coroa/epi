import Em from 'ember';
import Enums from '../enums';

export default Em.Controller.extend({
    needs: ['requirements'],
    staticDataLabels: true,
    categories: true,
    updateTrigger: true,
    data: Em.reduceComputed(
        'controllers.requirements.@each.'
            + '{vaccine,service,vaccine_volume_per_course,'
            + 'diluent_volume_per_course}',
        {
            initialValue: function() {
                return Em.Object.create({ maxValue: 0, values: []});
            },
            addedItem: function(accum, req, changeMeta) {

                var label = req.get('vaccine.initials') +
                        ' (' + req.get('vaccine.doses_per_vial') + ')',
                    service = req.get('service'),
                    vaccine = req.get('id'),
                    vaccine_volume = req.get('vaccine_volume_per_course'),
                    diluent_volume = req.get('diluent_volume_per_course');

                if([ service, vaccine ].any(Ember.isNone)) {
                    return accum;
                }
                // this.propertyWillChange('data');

                var serviceObj = accum.values.findBy('id', service);
                if (serviceObj === undefined) {
                    serviceObj = Em.Object.create({ values: [] });
                    accum.values.pushObject(serviceObj);
                }
                var vaccineObj = serviceObj.values.findBy('id', vaccine);
                if (vaccineObj === undefined) {
                    vaccineObj = Em.Object.create({ id: vaccine });
                    serviceObj.values.pushObject(vaccineObj);
                }
                serviceObj.setProperties(
                    {id: service,
                     key: Enums.service
                     .options[service]['short']});
                var total = vaccine_volume + diluent_volume;
                vaccineObj.setProperties(
                    {key: label,
                     values: [{key: label + ' - vaccine',
                               value: vaccine_volume},
                              {key: label + ' - diluent',
                               value: diluent_volume}],
                     total: total});

                if (total > accum.maxValue) {
                    accum.set('maxValue', total);
                }

                this.toggleProperty('updateTrigger');
                return accum;
            },
            removedItem: function(accum, req, changeMeta) {
                var f = function(key) {
                    return (changeMeta.previousValues !== undefined &&
                        changeMeta.previousValues[key] !== undefined)
                        ? changeMeta.previousValues[key] : req.get(key);
                };

                var vaccine = f('id'),
                    service = f('service');

                if([ vaccine, service ].any(Ember.isNone)) {
                    return accum;
                }

                var serviceObj = accum.values.findBy('id', service),
                    vaccineObj = serviceObj.values.findBy('id', vaccine);

                if (Ember.isNone(vaccineObj)) {
                    // ok, couldn't find it. let's hope it was ignored
                    // during one these phases were it still had some
                    // null values
                    return accum;
                }

                var total = vaccineObj.total;

                // this.propertyWillChange('data');

                // remove them
                serviceObj.values.removeObject(vaccineObj);
                if (serviceObj.values.length === 0) {
                    accum.values.removeObject(serviceObj);
                }

                if (total === accum.maxValue) {
                    accum.set('maxValue', accum.values.reduce(function(prev, cur) {
                        return Math.max(prev, cur.values.reduce(function(p, c) {
                            return Math.max(p, c.total);
                        }, 0));
                    }, 0));
                }

                // this.toggleProperty('updateTrigger');
                // console.log('set updateTrigger to', this.get('updateTrigger'));
                return accum;
            }
        })
});
