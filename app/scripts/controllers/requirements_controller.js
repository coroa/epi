App.RequirementsController = Ember.ArrayController.extend({
    itemController: 'requirement',
    sortProperties: ['created_at'],

    routineService: Em.computed.filterBy('@this', 'service',
                                         App.Enums.service.ROUTINE),
    schoolService: Em.computed.filterBy('@this', 'service',
                                        App.Enums.service.SCHOOL),
    siaService: Em.computed.filterBy('@this', 'service',
                                     App.Enums.service.SIA),
    otherService: Em.computed.filterBy('@this', 'service',
                                       App.Enums.service.OTHER),

    services: function() {
        return [ { serviceLabel:
                   App.Enums.service.options[App.Enums.service.ROUTINE].label,
                   vaccines: this.get('routineService') },
                 { serviceLabel:
                   App.Enums.service.options[App.Enums.service.SCHOOL].label,
                   vaccines: this.get('schoolService') },
                 { serviceLabel:
                   App.Enums.service.options[App.Enums.service.SIA].label,
                   vaccines: this.get('siaService') },
                 { serviceLabel:
                   App.Enums.service.options[App.Enums.service.OTHER].label,
                   vaccines: this.get('otherService') } ];
    }.property('routineService', 'schoolService',
               'siaService', 'otherService')
});
