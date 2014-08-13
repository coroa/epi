import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: [ 'requirements', 'sia-storage-volumes', 'requirement-sets' ],
    selectedRequirementSet: function(key, value) {
        if (arguments.length > 1) {
            // setter
            this.send('updateRequirementSet',
                      this.get('selectedRequirementSet'));
            return value;
        }
        return this.get('id');
    }.property('id'),
    interactions: [
        { label: 'Delete', event: 'del' },
        { label: 'Download', event: 'down' },
        { label: 'New Table', event: 'new' },
        { label: 'Upload', event: 'up' }
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
