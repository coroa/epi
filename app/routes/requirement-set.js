import Ember from 'ember';
/* global saveAs */

export default Ember.Route.extend({
    setupController: function(controller, model) {
        this._super.apply(this, arguments);
        var requirements = model.get('requirements');

        this.controllerFor('requirements')
            .set('model', requirements);
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
                                    'sia-storage-volumes']
                               .map(function(cntrl) {
                                   return this.controllerFor(cntrl).get('dirty');
                               }, this));
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
        deleteRequirementSet: function() {
            alert('deleteRequirementSet');
        },
        downloadRequirementSet: function() {
            var model = this.get('controller.model'),
                serialization = window.JSON.stringify(this.store.serializeRecursively(model)),
                blob = new Blob([serialization], {type: "text/plain;charset=utf-8"});
            saveAs(blob, model.get('name') + ".json");
        }

    }
});
