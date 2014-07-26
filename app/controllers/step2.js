import Ember from 'ember';
import Enums from '../enums';

var make_array = function(n) {
    var a = [];
    while(n --) {
        a.push(Ember.Object
               .create({ isAffected: false, value: 0 }));
    }
    return a;
};


export default Ember.Controller.extend({
    needs: ['requirements', 'levels'],
    resultTableHead: function() {
        var levels = this.get('controllers.levels').mapBy('name');
        return Ember.Object.create({
            no_levels: levels.length,
            first: Enums.temperature.options.map(function(el) {
                return 'Lts net storage requirement @ ' + el.label;
            }),
            second: [].concat.apply([], Enums.temperature.options.map(function() {
                return levels;
            }))
        });
    }.property('controllers.levels.@each.name'),
    resultTableLines: Ember.reduceComputed(null, {
            initialValue: function() { return []; },
            initialize: function(initialValue) {
                var no_levels = this.get('controllers.levels.length'),
                    no_temperatures = Enums.temperature.options.length;
                initialValue.setObjects(
                    Enums.service.options.map(function(opt) {
                        return Ember.Object.create({
                            label: opt.word,
                            content: make_array(no_levels * no_temperatures)
                        });
                    })
                );
            },
            addedItem: function(accum, item) {
                var f = function(key) { return item.get(key); };

                if ([ f('service'), f('temperature'), f('level') ]
                    .any(Ember.isNone)) {
                    return accum;
                }

                var levels = this.get('controllers.levels').mapBy('name'),
                    row = accum.objectAt(f('service')).get('content'),
                    index = f('temperature') * levels.length +
                        levels.indexOf(f('level')),
                    obj = row.objectAt(index);

                obj.incrementProperty('value', f('storage_volume'));
                obj.set('isAffected', f('isAffected'));

                return accum;
            },
            removedItem: function(accum, item) {
                var f = function(key) {return item.get(key);};

                if ([ f('service'), f('temperature'), f('level') ]
                    .any(Ember.isNone)) {
                    return accum;
                }

                var levels = this.get('controllers.levels').mapBy('name'),
                    row = accum.objectAt(f('service')).get('content'),
                    index = f('temperature') * levels.length +
                        levels.indexOf(f('level')),
                    obj = row.objectAt(index);

                obj.decrementProperty('value', f('storage_volume'));
                obj.set('isAffected', false);

                return accum;
            }
    }).property('controllers.requirements.storage_volume',
                'controllers.levels.[]')
});
