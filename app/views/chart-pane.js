import Em from 'ember';

export default Em.View.extend({
    templateName: Em.computed.alias('content.template'),
    controller: function() {
        // inherit, or confer to wish
        var controller = this.get('parentView.controller'),
            wish = this.get('content.controller');
        if (wish) {
            var resolved = this.get('container')
                    .lookup("controller:" + wish);
            if (resolved) { controller = resolved; }
        }
        return controller;
    }.property('content.controller'),
    isVisible: function() {
        Em.run.scheduleOnce('afterRender', this, 'rerender');
        return this.get('parentView.selected') ===
            this.get('content.id');
    }.property('parentView.selected', 'content.id'),
    render: function() {
        if (this.get('isVisible')) {
            return this._super.apply(this, arguments);
        } else {
            return '';
        }
    }
});
