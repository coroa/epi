import DS from 'ember-data';
import Em from 'ember';

var attr = DS.attr;

var Level = DS.Model.extend({
    paramsets: DS.hasMany('level-paramset', {inverse: 'level'}),
    name: attr('string')
});

export default Level;
