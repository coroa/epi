import Ember from 'ember';

export default Ember.Route.extend({
    setupController: function(controller, model) {
        this._super.apply(this, arguments);

        this.controllerFor('requirements')
            .set('model', model.get('requirements'));
        this.controllerFor('sia-storage-volumes')
            .set('model', model.get('siaStorageVolumes'));
    },
    afterModel: function(model) {
        // retrieve the async hasMany relations before entering the
        // route
        return Ember.RSVP.all([model.get('requirements'),
                               model.get('siaStorageVolumes')]);
    },
    model: function(params) {
        return this.store.find('requirement-set',
                               params.requirementSet_id);
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
            .then(
                function() {
                    console.log('saved successfully');
                },
                function() {
                    console.log('saving errored out');
                }
            );
        },
        doClear: function() {
            Ember.RSVP.all(this._collectDirtyModels().invoke('rollback'))
                .then(
                    function() {
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
        },
        addRequirement: function(req) {
            var set = this.get('controller.model');
            set.store.createRecord('requirement', req)
                .save()
                .then(function(record) {
                    return set.get('requirements')
                        .then(function(reqs) {
                            reqs.addObject(record);
                            return set.save();
                        });
                });
        },
        removeRequirement: function(req) {
            var set = this.get('controller.model'),
                model = req.get('model'),
                paramsets = model.get('levelParamsets');
            paramsets.invoke('destroyRecord');
            set.get('requirements').removeObject(model);
            model.destroyRecord().then(function() {
                set.save();
            });
        },
        setSiaStorageVolumes: function(items) {
            var set = this.get('controller.model');
            set.get('siaStorageVolumes').then(function(hasMany) {
                hasMany.invoke('destroyRecord');
                hasMany.setObjects(items);
            });
        },
        newRequirementSet: function() {
            alert('addRequirementSet');
        },
        deleteRequirementSet: function() {
            alert('deleteRequirementSet');
        },
        uploadRequirementSet: function() {
            alert('uploadRequirementSet');
        },
        downloadRequirementSet: function() {
            alert('downloadRequirementSet');
        }

    }
});
