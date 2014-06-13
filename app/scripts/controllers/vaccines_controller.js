App.VaccinesController = Ember.ArrayController.extend({
    itemController: 'vaccine',

    vaccineInitials: function() {
        return this.mapBy('initials').uniq();
    }.property('@each.initials')
});
