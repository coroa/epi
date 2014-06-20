import Ember from 'ember';

export default Ember.Controller.extend({
    steps: [ { name: 'Step 1',
               route: 'step1' },
             { name: 'Step 2',
               route: 'step2' } ]
});
