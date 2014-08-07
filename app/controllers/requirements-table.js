import Em from 'ember';

export default Em.ObjectController.extend({
    needs: ['vaccines', 'requirements', 'requirement-sets'],
    vaccineInitials: null,
    vaccine: null,
    vaccines: function() {
        return this.get('controllers.vaccines')
            .filterBy('initials', this.get('vaccineInitials'));
    }.property('vaccineInitials',
               'controllers.vaccines.@each.initials'),
    createRequirement: function() {
        var service = this.get('id'),
            vaccine = this.get('vaccine');

        if(Em.isEmpty(vaccine)) { return; }

        this.send('addRequirement', { service:service,
                                      vaccine:vaccine });

        this.set('vaccineInitials', null);
        this.set('vaccine', null);
    }.observes('vaccine')
});
