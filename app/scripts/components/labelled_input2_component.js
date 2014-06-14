var make_input_view = function(which) {
        return Ember.TextField.extend({
            valueBinding: 'parentView.value' + which,
            classNames: ['form-control'],
            init: function() {
                if (this.get('parentView')
                    .hasOwnProperty('default' + which + 'Binding'))
                {
                    this.set('classNameBindings',
                             ['parentView.isCustom' + which + ':btn-warning:btn-success']);
                }
                this._super();
            },
            willInsertElement: function() {
                this.set('parentView.labelFor' + which, this.get('elementId'));
            }
        });
    },
    make_is_custom = function(which) {
        return function() {
            return this.hasOwnProperty('default' + which + 'Binding')
                && this.get('value' + which) != this.get('default' + which);
        }.property('value' + which, 'default' + which);
    };

App.LabelledInput2Component = Ember.Component.extend({
    classNames: ['form-group', 'has-header-label'],
    labelFor1: null,
    labelFor2: null,
    isCustom1: make_is_custom("1"),
    isCustom2: make_is_custom("2"),

    init: function() {
        this.set('layoutName',
                 "components/labelled-input2-"
                 + (!Em.isNone(this.get('addon')) ? 'wA' : 'woA'));
        this._super.apply(this, arguments);
    },
    inputView1: make_input_view('1'),
    inputView2: make_input_view('2'),

    actions: {
        reset: function(which) {
            this.set('value' + which, this.get('default' + which));
        }
    }
});

Ember.Handlebars.helper('labelled-input2', App.LabelledInput2Component);
