import Em from 'ember';

export default Em.Controller.extend({
    needs: ['requirements'],
    data: Em.computed.map('controllers.requirements.@each.{vaccine,service,vaccine_volume_per_course,diluent_volume_per_course}', function(req) {
        return Em.Object.create(
            { category: req.get('service'),
              label: req.get('vaccine.initials') +
              ' (' + req.get('vaccine.doses_per_vial') + ')',
              values: Em.A([
                  req.get('vaccine_volume_per_course'),
                  req.get('diluent_volume_per_course') ])
            });
    })
});
