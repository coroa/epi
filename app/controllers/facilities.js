import Ember from 'ember';

export default Ember.ArrayController.extend({
    itemController: 'facility',
    maxValue: function() {
        return Math.max.apply(this, [0].concat(this.mapBy('maxValue')));
    }.property('@each.maxValue')

    // begin and endPropertyChanges affect ALL observers not just the
    // ones we call it upon.

    // suspendedFacilities: Ember.A(),
    // suspendFacilities: function() {
    //     var suspendedFacilities = this.get('suspendedFacilities');
    //     console.log('will suspend facilities');
    //     this.forEach(function(f) {
    //         if (! suspendedFacilities.contains(f)) {
    //             f.beginPropertyChanges();
    //             suspendedFacilities.pushObject(f);
    //         }
    //     });
    //     console.log('did suspend facilities');
    // },
    // resumeFacilities: function() {
    //     var suspendedFacilities = this.get('suspendedFacilities');
    //     console.log('will resume facilities');
    //     suspendedFacilities.forEach(function(f) {
    //         f.endPropertyChanges();
    //     });
    //     suspendedFacilities.clear();
    //     console.log('did resume facilities');

    // }
});
