import Ember from 'ember';

export default Ember.ArrayController.extend({
    itemController: 'level',
    sortProperties: ['id']
});
