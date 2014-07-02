import DS from 'ember-data';
import Em from 'ember';

var attr = DS.attr;

Em.computed.fallback = function(path, fallbackPath) {
    return Em.computed(function(key, newValue, cachedValue) {
        if (arguments.length === 1) {
            // getter
            var val = this.get(path);
            return !Em.isNone(val) ? val
                : this.get(fallbackPath);
        } else if(newValue != cachedValue) {
            // setter
            this.set(path, newValue);
            return newValue;
        } else {
            return cachedValue;
        }
    }).property(path, fallbackPath);
};

var Requirement = DS.Model.extend({
    service: attr('number'),
    vaccine: DS.belongsTo('vaccine'),
    vaccine_volume: attr('number'),
    diluent_volume: attr('number'),
    doses_course: attr('number', { defaultValue: null }),
    elligible_percent: attr('number', { defaultValue: null }),
    wastage_rate: attr('number'),
    levelParamsets: DS.hasMany('levelParamset', {inverse: 'requirement'}),

    vaccine_volume2: Em.computed.fallback('vaccine_volume',
                                          'vaccine.vaccine_volume'),
    vaccine_volume_isCustom: Em.computed.notEmpty('vaccine_volume'),
    diluent_volume2: Em.computed.fallback('diluent_volume',
                                          'vaccine.diluent_volume'),
    diluent_volume_isCustom: Em.computed.notEmpty('diluent_volume'),
    wastage_rate2: Em.computed.fallback('wastage_rate',
                                        'vaccine.wastage_rate'),
    wastage_rate_isCustom: Em.computed.notEmpty('wastage_rate'),

    wastage_factor: function() {
        return 1.0/(1.0-this.get('wastage_rate2')/100);
    }.property('wastage_rate2'),

    vaccine_volume_per_course: function() {
        return +(this.get('vaccine_volume2') * this.get('doses_course') *
                 (this.get('elligible_percent') / 100) *
                 this.get('wastage_factor')).toFixed(3);
    }.property('vaccine_volume2', 'doses_course', 'elligible_percent',
               'wastage_factor'),
    diluent_volume_per_course: function() {
        return +(this.get('diluent_volume2') * this.get('doses_course') *
                 (this.get('elligible_percent') / 100) *
                this.get('wastage_factor')).toFixed(3);
    }.property('diluent_volume2', 'doses_course', 'elligible_percent',
               'wastage_factor'),

    didCreate: function() {
        if (Em.isEmpty(this.get('levelParamsets'))) {
            var _this = this,
                all = Em.RSVP.all;
            console.log('Will create a levelParamset per level for ' +
                       _this + ': ');

            _this.store.find('level')
                .then(function(levels) {
                    return Em.RSVP.all(levels.map(function(level) {
                            return _this.store
                                .createRecord('level-paramset')
                                .save();
                    })).then(function(paramsets) {
                        return all(paramsets.map(function(ps, i) {
                            var level = levels.objectAt(i);
                            level.get('paramsets')
                                .pushObject(ps);
                            return all([ps.save(),
                                        level.save()]);
                        })).then(function() {
                            _this.get('levelParamsets')
                                .pushObjects(paramsets);
                            return all(paramsets.invoke('save')
                                       .concat([_this.save()]));
                        }).then(function() {
                            console.log('all saved');
                        });
                    });
                });
        }
    }
});

export default Requirement;
