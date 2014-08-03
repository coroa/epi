import Ember from 'ember';

export default Ember.Component.extend({
    tagName: "form",
    classNames: ["navbar-form", "navbar-right"],

    // interactions is a list with items, like
    // { label: "Do something", event: "do_something" }
    interactions: [],

    selectedObj: null,
    options: Ember.computed.map('{content,optionLabelPath,optionValuePath}', function(item) {
        var optionLabelPath = this.get('optionLabelPath'),
            optionValuePath = this.get('optionValuePath'),
            selected = (item === this.get('selection')),
            obj = Ember.Object.extend({
                label: Ember.computed.alias(optionLabelPath),
                value: Ember.computed.oneWay(optionValuePath)
            }).create({
                content: item,
                selected: selected
            });
        if (selected) {this.set('selectedObj', obj);}
        return obj;
    }),

    updateSelected: function() {
        var selection = this.get('selection'),
            selectedObj = null;
        this.get('options').forEach(function(item) {
            var selected = (item.get('content') === selection);
            item.set('selected', selected);
            if (selected) { selectedObj = item; }
        });
        this.set('selectedObj', selectedObj);
    }.observes('selection').on('init'),

    label: Ember.computed.alias('selectedObj.label'),
    value: Ember.computed(function(key, value, oldValue) {
        if (arguments.length !== 1) {
            if (value != oldValue) {
                this.updateSelectionFromValue(value);
            }
            return value;
        }
        return this.get('selectedObj.value');
    }).property('selectedObj'),
    updateSelectionFromValue: function(value) {
        var content = this.get('content'),
            selectedValue = this.get('selectedObj.value');

        if (value !== selectedValue) {
            this.set('selection',
                     Ember.get(this.get('options')
                               .findBy('value', value),
                               'content'));
        }
    },

    actions: {
        act: function(event) {
            debugger;
            this.sendAction(event, this.get('selection'));
        },
        select: function(value) {
            debugger;
            this.set('value', value);
        }
    }
});