import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    level: DS.belongsTo('level'),
    population: DS.hasMany('data-value', {async: true}),
    capacity: DS.hasMany('equipment-data-value', {async: true}),
    children: DS.hasMany('facility', {async: true})
});
