import Em from 'ember';

export default Em.ObjectController.extend({
    isActive: function() {
        return this.get('id') === this.get('parentController.vaccine.id');
    }.property('id', 'parentController.vaccine.id')
});
