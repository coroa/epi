import Ember from 'ember';

var Router = Ember.Router.extend({
  location: EpiENV.locationType
});

Router.map(function() {
  this.route('step1');
  this.route('step2');
});

export default Router;
