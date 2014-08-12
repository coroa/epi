import Ember from 'ember';

export default Ember.Component.extend({
    tagName: "select",
    optionValuePath: "content",
    optionLabelPath: "content",
    value: Ember.computed(function(key, value, oldValue) {
        if (arguments.length !== 1) {
            if (value != oldValue) { // jshint ignore:line
                this.updateSelectionFromValue(value);
            }
            return value;
        }
        var valuePath = this.get('optionValuePath').replace(/^content\.?/, '');
        return valuePath ? this.get('selection.' + valuePath) : this.get('selection');
    }).property('selection'),
    update: function() {
        var $el = this.$();
        this.set('hasFocus', !Ember.isNone($el) && $el.is(':focus'));
        this.rerender();
    }.observes('selection', 'content.@each'),
    render: function(buffer) {
        var labelKey = this.get("optionLabelPath")
                .replace("content.", ""),
            valueKey = this.get("optionValuePath")
                .replace("content.", "");

        var output = "";
        if (this.get("prompt")) {
            output += "<option>" + this.get("prompt") + "</option>";
        }
        output += this.get("content").map(function(obj){
            var value = valueKey === "content" ? obj : Ember.get(obj, valueKey),
                label = labelKey === "content" ? obj : Ember.get(obj, labelKey),
                selected = this.get('selection') === obj;
            return "<option" +
                " value='"+value+"'" +
                (selected ? " selected" : "") +
                ">" +
                label +
                "</option>";
        }, this).join("");

        buffer.push(output);
    },
    didInsertElement: function() {
        if (this.get('hasFocus')) {
            this.$().focus();
        }
    },
    updateSelectionFromValue: function(value) {
        var content = this.get('content'),
            valuePath = this.get('optionValuePath').replace(/^content\.?/, ''),
            selectedValue = (valuePath ?
                             this.get('selection.' + valuePath)
                             : this.get('selection')),
            selection;

        if (value !== selectedValue) {
            selection = content ? content.find(function(obj) {
                return value === (valuePath ? Ember.get(obj,valuePath) : obj);
            }) : null;

            this.set('selection', selection);
        }
    },
    _change: function() {
        var selectedIndex = this.$()[0].selectedIndex,
            content = this.get('content'),
            prompt = this.get('prompt');

        if (Ember.isEmpty(content)) { return; }
        if (prompt && selectedIndex === 0) { this.set('selection', null); return; }
        if (prompt) { selectedIndex -= 1; }
        this.set('selection', content.objectAt(selectedIndex));
    }.on("change")
});
