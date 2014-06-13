App.ApplicationController = Ember.Controller.extend({
    needs: [ "requirements", "vaccines" ],
    steps: [ { name: 'Step 1',
               route: 'step1' } ]
});
