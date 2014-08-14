import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: [ 'requirements', 'sia-storage-volumes', 'requirement-sets' ],
    selectedRequirementSet: function(key, value) {
        if (arguments.length > 1) {
            // setter
            if (this.get('selectedRequirementSet') !== value) {
                this.send('updateRequirementSet', value);
            }
            return value;
        }
        return this.get('id');
    }.property('id'),
    interactions: [
        { label: 'New Table', event: 'new', iconClass: 'fa-table' },
        { label: 'Load from file', event: 'up', iconClass: 'fa-upload' },
        { label: 'Save to file', event: 'down', iconClass: 'fa-download' },
        { label: 'Delete', event: 'del', iconClass: 'fa-trash-o' }
    ],
    steps: [ { name: 'Step 1',
               route: 'requirement-set.step1' },
             { name: 'Step 2',
               route: 'requirement-set.step2' },
             { name: 'Step 3',
               route: 'requirement-set.step3' } ],
    isDirty: Ember.computed.or('controllers.requirements.isDirty',
                               'controllers.sia-storage-volumes.isDirty'),
    actions: {
        save: function() {
            this.get('model').save();
        }
    }
});
