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
    doses_course: attr('number'),
    elligible_percent: attr('number'),
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
            var _this = this;
            console.log('Will create a levelParamset per level for ' +
                       _this + ': ');

            _this.store.find('level')
                .then(function(levels) {
                    return Em.RSVP.map(
                        levels.map(function(level) {
                            return _this.store
                                .createRecord('levelParamset',
                                              { level: level })
                                .save();
                        }),
                        function(level) {
                            _this.get('levelParamsets').pushObject(level);
                            return level.save();
                        }
                    );
                })
                .then(function() {
                    console.log(_this.get('levelParamsets'));
                    return _this.save();
                });
        }
    }
});

Requirement.reopenClass({
    FIXTURES: [
        { id: 1,
          service: 0,
          vaccine: 1,
          vaccine_volume: null,
          diluent_volume: null,
          doses_course: 1,
          elligible_percent: 3.1,
          wastage_rate: null,
          safety_stock: 25,
          inuse: true,
          levelParamsets: [ 1, 2, 3, 4, 5 ]
        },
        { id: 2,
          service: 0,
          vaccine: 3,
          vaccine_volume: 2.0,
          diluent_volume: 0,
          doses_course: 3,
          elligible_percent: 3.1,
          wastage_rate: 25,
          safety_stock: 25,
          inuse: true,
          levelParamsets: [ 6, 7, 8, 9, 10 ]
        }
    ]
});

export default Requirement;
