import Em from 'ember';
import DS from 'ember-data';
import Enums from '../enums';

var attr = DS.attr;

export default DS.Model.extend({
    name: DS.attr('string')
});
