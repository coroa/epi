import Em from 'ember';

export default Em.Component.extend({
    // binding on value, label, title and selected_chart

    tagName: 'li',
    classNameBindings: [ 'active' ],
    attributeBindings: [ 'title' ],
    active: function() {
        return this.get('selected_chart') === this.get('value');
    }.property('selected_chart', 'value'),

    actions: {
        handleClick: function() {
            if (this.get('active')) {
                this.set('selected_chart', null);
            } else {
                this.set('selected_chart', this.get('value'));
            }
        }
    }
});
