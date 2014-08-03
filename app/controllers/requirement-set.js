import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: [ 'requirements', 'level-paramsets', 'requirement-sets' ],
    selectedRequirementSet: Ember.computed.oneWay('id'),
    doUpdateRequirementSet: function() {
        this.send('updateRequirementSet',
                  this.get('selectedRequirementSet'));
    }.observes('selectedRequirementSet'),
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
                               'controllers.level-paramsets.isDirty')
});
