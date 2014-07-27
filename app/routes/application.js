import Ember from 'ember';

export default Ember.Route.extend({
    setupController: function() {
        // this.controllerFor('requirements').set('model',
        //                                        this.store.find('requirement'));
        console.log('setup application controller');
        this._super.apply(this, arguments);

        this.controllerFor('levels')
            .set('model', this.store.find('level'));
        this.controllerFor('requirements')
            .set('model', this.store.find('requirement'));
        this.controllerFor('vaccines')
            .set('model', this.store.find('vaccine'));
        this.controllerFor('level-paramsets')
            .set('model', this.store.find('level-paramset'));

        // this.store.createRecord('vaccine', {'product': 'help',
        //                                     'presentation':
        //                                     'bar'}).save()
        //     .then(function(record) {
        //         debugger;
        //     });
    },
    _collectDirtyModels: function() {
        return [].concat.apply([], ['requirements',
                                    'level-paramsets']
                               .map(function(cntrl) {
                                   return this.controllerFor(cntrl).get('dirty');
                               }, this)).mapBy('model');
    },
    actions: {
        doSave: function() {
            Ember.RSVP.all(this._collectDirtyModels().invoke('save'))
            .then(function() {
                console.log('saved successfully');
            },
                  function() {
                      console.log('saving errored out');
                  });
        },
        doClear: function() {
            Ember.RSVP.all(this._collectDirtyModels().invoke('rollback'))
                .then(function() {
                    console.log('rollback successfully');
                },
                      function() {
                          console.log('rollback errored out');
                      });
        },
        doTrash: function() {
            Ember.RSVP.all(this.controllerFor('requirements')
                           .mapBy('model')
                           .invoke('destroyRecord'))
                .then(function() {
                    console.log('all cleared');
                });
        }
    }
});
