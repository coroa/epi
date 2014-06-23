import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: [ 'requirements', 'level-paramsets' ],
    steps: [ { name: 'Step 1',
               route: 'step1' },
             { name: 'Step 2',
               route: 'step2' } ],
    isDirty: Ember.computed.or('controllers.requirements.isDirty',
                               'controllers.level-paramsets.isDirty')
});
