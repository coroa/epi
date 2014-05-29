var attr = DS.attr;

App.Vaccine = DS.Model.extend({
    name: attr('string'),
    restock: attr('number'),
    inuse: attr('boolean')
});

App.Vaccine.FIXTURES = [
    { id: 1, name: 'Trek', restock: 4, inuse: true },
    { id: 2, name: 'Tom' , restock: 2, inuse: true }
];
