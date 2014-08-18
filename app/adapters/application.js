import DS from 'ember-data';
import Em from 'ember';

/**
 * The main storage adapter for the application uses the localstorage
 * facility of the browser. It is extended by two methods `resetData`
 * to clear all the data in the localStorage buffer and `loadData`,
 * which bootstraps the storage by a ready-made json file, which holds
 * the vaccine database
 *
 * @class ApplicationAdapter
 * @extends DS.LSAdapter
 */

export default DS.LSAdapter.extend({
    namespace: 'epi',
    bootstrap: 'assets/storage.json',

    resetData: function() {
        localStorage.removeItem(this.adapterNamespace());
    },

    loadData: function() {
        var ret = this._super();
        if (Em.$.isEmptyObject(ret)) {
            Em.$.ajax({ url: this.get('bootstrap'),
                        async: false,
                        dataType: 'json',
                        success: function(response) {
                            console.log('downloaded json');
                            ret = response;
                        },
                        complete: function(foo, bar) {
                            console.log(bar);
                        }});
            localStorage.setItem(this.adapterNamespace(),
                                 JSON.stringify(ret));
        }
        return ret;
    }
});
