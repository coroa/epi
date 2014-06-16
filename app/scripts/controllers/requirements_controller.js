App.RequirementsController = Ember.ArrayController.extend({
    itemController: 'requirement',
    sortProperties: ['id'],

    routineService: Em.computed.filterBy('@this', 'service',
                                         App.Enums.service.ROUTINE),
    schoolService: Em.computed.filterBy('@this', 'service',
                                        App.Enums.service.SCHOOL),
    siaService: Em.computed.filterBy('@this', 'service',
                                     App.Enums.service.SIA),
    otherService: Em.computed.filterBy('@this', 'service',
                                       App.Enums.service.OTHER),

    services: function() {
        return  ['routine','school','sia','other'].map(function(service) {
            var id = App.Enums.service[service.toUpperCase()];
            return { id: id,
                     label: App.Enums.service.options[id].label,
                     requirements: this.get(service + 'Service') };
        }, this);
    }.property('routineService', 'schoolService',
               'siaService', 'otherService')
});
