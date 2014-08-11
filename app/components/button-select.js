import Ember from 'ember';

export default Ember.Component.extend({
    tagName: "form",
    classNames: ["navbar-form", "navbar-right"],

    // interactions is a list with items, like
    // { label: "Do something", event: "do_something" }
    interactions: [],

    selectedObj: null,
    options: Ember.computed.map(null, function(item) {
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
    }).property('content','optionLabelPath','optionValuePath'),

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
        var selectedValue = this.get('selectedObj.value');

        if (value !== selectedValue) {
            var option = this.get('options').findBy('value', value);
            this.set('selection',
                     Ember.isNone(option) ? null : Ember.get(option, 'content'));
        }
    },

    actions: {
        act: function(event) {
            this.sendAction(event, this.get('selection'));
        },
        select: function(value) {
            this.set('value', value);
        },
        save: function() {
            this.sendAction('save');
        }
   }
});
