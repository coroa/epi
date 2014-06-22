import Em from 'ember';

export default Em.Controller.extend({
    needs: ['requirements'],
    data: Em.computed.map('controllers.requirements.@each.{vaccine,service,vaccine_volume_per_course,diluent_volume_per_course}', function(req) {
        var label = req.get('vaccine.initials') +
                ' (' + req.get('vaccine.doses_per_vial') + ')';
        return { id: req.get('id'),
                 category: req.get('service'),
                 label: label,
                 sublabels: [ label + ' - vaccine', label + ' -'
                              + ' diluent' ],
                 values: [ req.get('vaccine_volume_per_course'),
                           req.get('diluent_volume_per_course') ] };
    })
});
