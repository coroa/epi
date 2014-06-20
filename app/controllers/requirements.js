import Em from 'ember';
import Enums from '../enums';

export default Em.ArrayController.extend({
    itemController: 'requirement',
    routineService: Em.computed.filterBy('@this', 'service',
                                         Enums.service.ROUTINE),
    schoolService: Em.computed.filterBy('@this', 'service',
                                        Enums.service.SCHOOL),
    siaService: Em.computed.filterBy('@this', 'service',
                                     Enums.service.SIA),
    otherService: Em.computed.filterBy('@this', 'service',
                                       Enums.service.OTHER),

    services: function() {
        return  ['routine','school','sia','other'].map(function(service) {
            var id = Enums.service[service.toUpperCase()];
            return { id: id,
                     label: Enums.service.options[id].label,
                     requirements: this.get(service + 'Service') };
        }, this);
    }.property('routineService', 'schoolService',
               'siaService', 'otherService')

});
