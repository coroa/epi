import DS from 'ember-data';
import Em from 'ember';
import fallback from '../utils/fallback';
import DestroyRecursivelyMixin from '../mixins/destroy-recursively';

var attr = DS.attr;

var Requirement = DS.Model.extend(DestroyRecursivelyMixin, {
    service: attr('number'),
    vaccine: DS.belongsTo('vaccine'),
    vaccine_volume: attr('number'),
    diluent_volume: attr('number'),
    doses_course: attr('number', { defaultValue: null }),
    elligible_percent: attr('number', { defaultValue: null }),
    wastage_rate: attr('number'),
    levelParamsets: DS.hasMany('levelParamset',
                               {inverse: 'requirement',
                                embedded: 'onsave'}),

    vaccine_volume2: fallback('vaccine_volume',
                              'vaccine.vaccine_volume'),
    vaccine_volume_isCustom: Em.computed.notEmpty('vaccine_volume'),
    diluent_volume2: fallback('diluent_volume',
                              'vaccine.diluent_volume'),
    diluent_volume_isCustom: Em.computed.notEmpty('diluent_volume'),
    wastage_rate2: fallback('wastage_rate',
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
            Em.run.schedule("actions", this, this._addLevelParamsets);
        }
    },
    _addLevelParamsets: function() {
        var _this = this,
            all = Em.RSVP.all,
            levels = _this.store.all('level');
        console.log('Will create a levelParamset per level for ' +
                    _this + ': ');

        all(levels.map(function() {
            return _this.store
                .createRecord('level-paramset')
                .save();
        })).then(function(paramsets) {
            // _this.get('levelParamsets').pushObjects(paramsets);
            return all(paramsets.map(function(ps, i) {
                var level = levels.objectAt(i);
                ps.set('level', level);
                return ps.save();
            })).then(function() {
                _this.get('levelParamsets')
                    .pushObjects(paramsets);
                return all([ _this.save(),
                             paramsets.invoke('save') ]);
            }).then(function() {
                console.log('all saved');
            });
        });
    },
    didDelete: function() {
        // Em.assert("levelParamsets must not be deleted yet",
        //           this.get('levelParamsets.length') > 0);
        // this.get('levelParamsets').invoke('destroyRecord');
    }
});

export default Requirement;
