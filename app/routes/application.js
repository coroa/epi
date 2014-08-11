import Ember from 'ember';
import DHIS from '../utils/dhis';

export default Ember.Route.extend({
    controllerName: 'requirement-sets',
    setupController: function() {
        // this.controllerFor('requirements').set('model',
        //                                        this.store.find('requirement'));
        console.log('setup application controller');
        this._super.apply(this, arguments);

        this.controllerFor('levels')
            .set('model', this.store.find('level'));
        this.controllerFor('vaccines')
            .set('model', this.store.find('vaccine'));
        // this.controllerFor('requirement-sets')
        //     .set('model', this.store.find('requirement-set'));

        // this.store.find('facility');
    },
    model: function() {
        return this.store.find('requirement-set');
    },

    actions: {
        updateRequirementSet: function(id) {
            this.transitionTo('requirement-set.index', id);
        },

        error: function(error, transition) {
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
