import Ember from 'ember';
import Enums from '../enums';

var TemperatureCell = Ember.Object.extend({
        requirement: function() {
            var population = this.get('facility.population');
            if (population.get('length') > 0) {
                return this.get('services')
                    .mapBy('value2')
                    .reduce(function(a,b) { return a+b; })
                    * (population.objectAt(0).get('value') || 0)
                    / 1000.0;
            } else {
                return 0;
            }
        }.property('services.@each.value2', 'facility.population.@each.value'),
        capacity: function() {
            return this.get('requirement') * 0.8;
        }.property('requirement')
    });

export default Ember.ObjectController.extend({
    needs: [ 'requirements', 'levels', 'facilities' ],

    title: Ember.computed.oneWay('name'),

    wrappedChildren: Ember.computed.map('children', function(child) {
        return this.get('controllers.facilities').findBy('id', child.get('id'));
    }),

    data: function() {
        var controller = this;
        controller.beginPropertyChanges();
        this.get('population').then(function() {
            controller.endPropertyChanges();
        });

        var levels = this.get('controllers.levels').mapBy('id'),
            levelOffset = levels.indexOf(this.get('level.id')),
            resultTable = this.get('controllers.requirements.resultTable'),
            facility = this;

        return Enums.temperature.options.map(function(temp) {
            var index = temp.id * levels.length + levelOffset;
            return TemperatureCell.create({
                temperature: temp.id,
                services: resultTable.map(function(row) {
                    return row.get('content').objectAt(index);
                }),
                facility: facility
            });
        });
    }.property('level',
               'controllers.levels.[]',
               'controllers.requirements.resultTable.[]'),
    maxValue: function() {
        return Math.max.apply(0, this.get('data').map(function(cell) {
            return Math.max(cell.get('requirement'), cell.get('capacity'));
        }));
    }.property('data.@each.{requirement,capacity}'),
    hasValue: Ember.computed.gt('maxValue', 0),
    totalDifference: function() {
        return this.get('data').map(function(d) {
            return Math.max(0, d.get('requirement') - d.get('capacity'));
        }).reduce(function(a,b) { return a+b; });
    }.property('data.@each.{requirement,capacity}')
});
