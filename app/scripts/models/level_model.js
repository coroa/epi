var attr = DS.attr;

App.Level = DS.Model.extend({
    name: attr('string'),
    warm_diluent: attr('boolean'),
    reorder_freq: attr('number')
});


App.Level.Fixtures = [
    { id: 1,
      name: 'Level 1',
      warm_diluent: false,
      reorder_freq: 2 },
    { id: 2,
      name: 'Level 2',
      warm_diluent: false,
      reorder_freq: 4 },
    { id: 3,
      name: 'Level 3',
      warm_diluent: true,
      reorder_freq: 12 }
];
