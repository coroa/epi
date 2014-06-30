import Em from 'ember';
import Enums from '../enums';

var do_stuff = function(accum) {
    var queue = this.get('queue'), ch,
        total = 0, newTotal = 0, updateMaxValue = false,
        serviceObj, vaccineObj;
    // propertyWill/DidChange block the browser indefinitely
    this.propertyWillChange('data');
    while((ch = queue.shiftObject()) !== null) {
        if (ch.action === 'remove') {
            // let's find the element first
            serviceObj = accum.values.findBy('id', ch.service);
            vaccineObj = serviceObj.values.findBy('id', ch.vaccine);
            total = vaccineObj.total;

            // peek ahead whether the next one adds the
            // same element (thus it is only a change)
            if (queue[0].action === 'add' &&
                ch.index === queue[0].index) {
                ch = queue.shiftObject();

                console.log('doing an update of item', ch.index);
            } else {
                // remove them
                serviceObj.values.removeObject(vaccineObj);
                if (serviceObj.values.length === 0) {
                    accum.values.removeObject(serviceObj);
                }
            }
        } else if(ch.action === 'add') {
            // find and create, if necessary
            serviceObj = accum.values.findBy('id', ch.service);
            if (serviceObj === undefined) {
                serviceObj = Em.Object.create({ values: [] });
                accum.values.pushObject(serviceObj);
            }
            vaccineObj = serviceObj.values.findBy('id', ch.vaccine);
            if (vaccineObj === undefined) {
                vaccineObj = Em.Object.create({ id: ch.vaccine });
                serviceObj.values.pushObject(vaccineObj);
            }
        }

        if (ch.action === 'add') {
            // add or update
            serviceObj.setProperties(
                {id: ch.service,
                 key: Enums.service
                 .options[ch.service]['short']});
            newTotal = ch.vaccine_volume + ch.diluent_volume;
            vaccineObj.setProperties(
                {key: ch.label,
                 values: [{key: ch.label + ' - vaccine',
                           value: ch.vaccine_volume},
                          {key: ch.label + ' - diluent',
                           value: ch.diluent_volume}],
                 total: newTotal});
        }

        if (newTotal > total) {
            if (newTotal > accum.maxValue) {
                accum.set('maxValue', newTotal);
            }
        } else {
            if (total === accum.maxValue) {
                updateMaxValue = true;
            }
        }
    }

    if (updateMaxValue) {
        accum.maxValue = accum.values.reduce(function(prev, cur) {
            return Math.max(prev, cur.values.reduce(function(p, c) {
                return Math.max(p, c.total);
            }));
        });
    }
    // propertyDidChange from a scheduled task blocks the browser
    this.propertyDidChange('data');
};


export default Em.Controller.extend({
    needs: ['requirements'],
    staticDataLabels: true,
    categories: true,

    data: Em.reduceComputed(
        'controllers.requirements.@each.'
            + '{vaccine,service,vaccine_volume_per_course,'
            + 'diluent_volume_per_course}',
        {
            initialValue: function() {
                return Em.Object.create({ maxValue: 0, values: []});
            },
            initialize: function() { this.set('queue', []); },
            addedItem: function(accum, req, changeMeta) {
                var label = req.get('vaccine.initials') +
                        ' (' + req.get('vaccine.doses_per_vial') + ')';
                this.get('queue').pushObject({
                    action: 'add',
                    index: changeMeta.index,
                    label: label,
                    service: req.get('service'),
                    vaccine: req.get('id'),
                    vaccine_volume: req.get('vaccine_volume_per_course'),
                    diluent_volume: req.get('diluent_volume_per_course')
                });
                Em.run.scheduleOnce('actions', this, do_stuff, accum);

                return accum;
            },
            removedItem: function(accum, req, changeMeta) {
                if (!changeMeta.previousValues) { return accum; }
                this.get('queue').pushObject({
                    action: 'remove',
                    index: changeMeta.index,
                    vaccine: changeMeta.previousValues.id
                        || req.get('id'),
                    service: changeMeta.previousValues.service
                        || req.get('service') });
                Em.run.scheduleOnce('actions', this, do_stuff, accum);

                return accum;
            }
        })
});
