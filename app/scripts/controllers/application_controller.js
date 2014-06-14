App.ApplicationController = Ember.Controller.extend({
    needs: [ "requirements", "vaccines" ],
    steps: [ { name: 'Step 1',
               route: 'step1' },
             { name: 'Step 2',
               route: 'step2' } ]
});
