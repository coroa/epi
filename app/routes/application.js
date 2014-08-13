import Ember from 'ember';
import DHIS from '../utils/dhis';
import uploadJSON from '../utils/upload-file';

export default Ember.Route.extend({
    controllerName: 'requirement-sets',
    setupController: function(controller, model) {
        console.log('application router setupController');
        this._super(controller, model.requirementSets);

        this.controllerFor('levels')
            .set('model', model.levels);
        this.controllerFor('vaccines')
            .set('model', this.store.find('vaccine'));
    },
    model: function() {
        console.log('application router model');
        return Ember.RSVP.hash(
            { requirementSets: this.store.find('requirement-set'),
              levels: this.store.find('level') }
        );
    },

    actions: {
        newRequirementSet: function() {
            var names = this.controllerFor('requirement-sets')
                    .mapBy('name'),
                set, i = 1;
            while (names.contains("Unnamed " + i)) {i ++;}

            set = this.store.createRecord('requirement-set',
                                          {name: "Unnamed " + i})
                .save();

            this.send('updateRequirementSet', set);
        },
        uploadRequirementSet: function() {
            var _this = this;
            uploadJSON().then(function(payload) {
                var set = _this.store.loadRecordFromPayloadRecursively('requirement-set', payload);
                _this.send('updateRequirementSet', set);
            });
        },
        updateRequirementSet: function(id) {
            this.transitionTo('requirement-set.index', id);
        },

        error: function(error) {
            if (error &&
                (error.getResponseHeader &&
                 error.responseText &&
                 // this is a jqXHR object
                 error.getResponseHeader('content-type')
                 .search('text/html') !== -1 &&
                 error.responseText
                 .search('dhis-web-commons-security/login.action')
                 // and it's the login form we got back
                ))
            {
                // error substate and parent routes do not handle this error
                window.location.replace(DHIS.loginForm);
                return false;
            }

            // Return true to bubble this event to any parent route.
            return true;
        }
    }
});
