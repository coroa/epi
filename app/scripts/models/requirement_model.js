var attr = DS.attr;

App.Requirement = DS.Model.extend({
    name: attr('string'),
    doses_per_vial: attr('number'),
    vaccine_volume: attr('number'),
    diluent_volume: attr('number'),
    doses_series: attr('number'),
    target_percent: attr('number'),
    wastage_rate: attr('number'),
    safety_stock: attr('number'),
    inuse: attr('boolean')
});

App.Requirement.FIXTURES = [
    { id: 1,
      name: 'BCG',
      doses_per_vial: 20,
      vaccine_volume: 1.2,
      diluent_volume: 1.1,
      doses_series: 1,
      target_percent: 3.1,
      wastage_rate: 60,
      safety_stock: 25,
      inuse: true },
    { id: 2,
      name: 'OPV',
      doses_per_vial: 10,
      vaccine_volume: 2.0,
      diluent_volume: 0,
      doses_series: 3,
      target_percent: 3.1,
      wastage_rate: 25,
      safety_stock: 25,
      inuse: true }
];
