import Ember from 'ember';
import AffectingMixin from 'epi/mixins/affecting';

module('AffectingMixin');

// Replace this with your real tests.
test('it works', function() {
  var AffectingObject = Ember.Object.extend(AffectingMixin);
  var subject = AffectingObject.create();
  ok(subject);
});
