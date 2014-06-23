import DS from 'ember-data';

var attr = DS.attr;

var Vaccine = DS.Model.extend({
    product: attr('string'),
    initials: attr('string'),
    formulation: attr('string'),
    admin_route: attr('string'),
    product_id: attr('string'),
    presentation: attr('string'),
    diluents: attr('string'),
    integrated_delivery_device: attr('string'),

    doses_per_vial: attr('string'),
    vaccine_volume: attr('number'),
    diluent_volume: attr('number'),
    wastage_rate: attr('number'),

    vvm_type: attr('string'),
    manufacturer: attr('string'),
    qualification_date: attr('string'),
    data_source_notes: attr('string'),

    label: function() {
        return this.get('initials') + ' (' +
            this.get('doses_per_vial') + ')';
    }.property('initials', 'doses_per_vial')
});

export default Vaccine;
