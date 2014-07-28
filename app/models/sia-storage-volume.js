import DS from 'ember-data';

export default DS.Model.extend({
    level: DS.belongsTo('level'),
    temperature: DS.attr('number'),
    storage_volume: DS.attr('number')
});
