import Em from 'ember';
import Enums from '../enums';
import insertSortedBy from '../utils/insert-sorted-by';

export default Em.Controller.extend({
    needs: ['requirements'],
    needsUpdate: true,
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

                var serviceObj = accum.values.findBy('key', service);
                if (serviceObj === undefined) {
                    serviceObj = Em.Object.create({ values: [] });
                    accum.values.pushObject(serviceObj);
                }
                var vaccineObj = serviceObj.values.findBy('key', vaccine);
                if (vaccineObj === undefined) {
                    vaccineObj = Em.Object.create({ key: vaccine,
                                                    index: changeMeta.index });
                    insertSortedBy(serviceObj.values, vaccineObj, 'index');
                }
                serviceObj.setProperties(
                    {key: service,
                     label: Enums.service
                     .options[service]['short']});
                var total = vaccine_volume + diluent_volume;
                vaccineObj.setProperties(
                    {key: vaccine,
                     label: label,
                     values: [{label: label + ' - vaccine',
                               key: vaccine + '_vac',
                               value: vaccine_volume},
                              {label: label + ' - diluent',
                               key: vaccine + '_dil',
                               value: diluent_volume}],
                     total: total});

                if (total > accum.maxValue) {
                    accum.set('maxValue', total);
                }

                this.set('needsUpdate', true);
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

                var serviceObj = accum.values.findBy('key', service),
                    vaccineObj = serviceObj.values.findBy('key', vaccine);

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

                this.set('needsUpdate', true);
                // console.log('set updateTrigger to', this.get('updateTrigger'));
                return accum;
            }
        })
});
