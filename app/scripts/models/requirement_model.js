var attr = DS.attr;

App.Requirement = DS.Model.extend({
    type: attr('string'),
    vaccine: DS.belongsTo('vaccine'),
    vaccine_volume: attr('number'),
    diluent_volume: attr('number'),
    doses_course: attr('number'),
    elligible_percent: attr('number'),
    wastage_rate: attr('number'),
    safety_stock: attr('number'),
    inuse: attr('boolean'),

    vaccine_volume_per_course: function() {
        return +(this.get('vaccine_volume') * this.get('doses_course') *
                 (this.get('elligible_percent') / 100)).toFixed(3);
    }.property('vaccine_volume', 'doses_course', 'elligible_percent'),
    diluent_volume_per_course: function() {
        return +(this.get('diluent_volume') * this.get('doses_course') *
                 (this.get('elligible_percent') / 100)).toFixed(3);
    }.property('diluent_volume', 'doses_course', 'elligible_percent')
});

App.Requirement.FIXTURES = [
    { id: 1,
      type: 'routine',
      vaccine: 1,
      vaccine_volume: 1.2,
      diluent_volume: 1.1,
      doses_course: 1,
      elligible_percent: 3.1,
      wastage_rate: 60,
      safety_stock: 25,
      inuse: true },
    { id: 2,
      type: 'routine',
      vaccine: 3,
      vaccine_volume: 2.0,
      diluent_volume: 0,
      doses_course: 3,
      elligible_percent: 3.1,
      wastage_rate: 25,
      safety_stock: 25,
      inuse: true }
];
