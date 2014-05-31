var attr = DS.attr;

App.Vaccine = DS.Model.extend({
    name: attr('string'),
    formulation: attr('string'),
    admin_route: attr('string'),
    product_id: attr('string'),
    presentation: attr('string'),
    doses_per_vial: attr('number'),
    vaccine_volume: attr('number'),
    diluent_volume: attr('number'),
    doses_series: attr('number'),
    wastage_rate: attr('number')
});

App.Vaccine.FIXTURES = [
    { id: 1,
      name: 'BCG',
      formulation: 'freeze-dried',
      admin_route: 'ID',
      product_id: 'BCG Vaccine SSI',
      presentation: 'boxes of 50 vials of 10-doses of vaccine +'
                    + ' diluents',
      doses_per_vial: 10,
      vaccine_volume: 1.2,
      diluent_volume: 1.1,
      doses_series: 1,
      wastage_rate: 60
    },
    { id: 2,
      name: 'BCG',
      formulation: 'freeze-dried',
      admin_route: 'ID',
      product_id: 'BCG Vaccine',
      presentation: 'boxes of 50 vials of 20-doses of vaccine +'
      + ' diluents',
      doses_per_vial: 20,
      vaccine_volume: 1.2,
      diluent_volume: 1.1,
      doses_series: 1,
      wastage_rate: 60
    },
    { id: 3,
      name: 'OPV',
      formulation: 'liquid',
      admin_route: 'Oral',
      product_id: 'Dukoral',
      presentation: 'pack of 2 dose of vaccine + buffer',
      doses_per_vial: 20,
      vaccine_volume: 2.0,
      diluent_volume: 0,
      doses_series: 3,
      wastage_rate: 25
    }
];
