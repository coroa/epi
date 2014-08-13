import Ember from 'ember';
import DestroyRecursivelyMixin from 'epi/mixins/destroy-recursively';

module('DestroyRecursivelyMixin');

// Replace this with your real tests.
test('it works', function() {
    var DestroyRecursivelyObject = Ember.Object.extend(DestroyRecursivelyMixin);
    var subject = DestroyRecursivelyObject.create();
    ok(subject);
});
