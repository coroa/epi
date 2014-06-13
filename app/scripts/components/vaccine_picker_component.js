App.VaccinePickerComponent = Ember.Component.extend({
    classNames: ['btn-group'],
    // expects bindings on initials, vaccines and vaccine
    curInitials: Ember.computed.oneWay('vaccine.initials'),
    filteredVaccines: function() {
        var curInitials = this.get('curInitials');
        if (curInitials !== undefined) {
            // return controller.filterBy('initials', curInitials);
            return this.get('vaccines').store.filter(
                'vaccine',
                function(vac) { return vac.get('initials') == curInitials; }
            );
        } else {
            return [];
        }
    }.property('vaccines', 'curInitials'),

    isInitialsVisible: false,
    isVaccineDetailsVisible: false,

    // updateInitialsVisible: function() {
    //     Ember.run.once(this, 'setFocus', '#initials > li');
    // }.observes('isInitialsVisible'),

    updateDetailsVisible: function() {
        Ember.run.once(this, 'setFocus', '#details > li');
    }.observes('isVaccineDetailsVisible'),

    setFocus: function(elid) {
        console.log('setting focus');
        console.log(this.$().find(elid).first());
        this.$().find(elid).first().focus();
    },

    didInsertElement: function() {
        console.log("didInsert");
        var $ul = this.$().find("#details > li").first();
        $ul.attr('tabindex', 0);
    },

    actions: {
        toggleInitialsVisible: function() {
            this.toggleProperty('isInitialsVisible');
        },
        toggleVaccineDetailsVisible: function() {
            this.toggleProperty('isVaccineDetailsVisible');
        },
        setInitials: function(ini) {
            this.set('isInitialsVisible', false);
            this.set('curInitials', ini);
            this.set('isVaccineDetailsVisible', true);
        },
        setVaccine: function(vac) {
            console.log(vac);
            this.set('vaccine', vac);
        },
        handleKey: function(target, event) {
            console.log("pressed");
            console.log(event);
        }
    }
});
