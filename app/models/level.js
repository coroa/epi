import DS from 'ember-data';

var attr = DS.attr;

var Level = DS.Model.extend({
    name: attr('string')
});

export default Level;
