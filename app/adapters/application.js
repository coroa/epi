import DS from 'ember-data';
import Em from 'ember';


// export default DS.FixtureAdapter.extend({
// });
export default DS.LSAdapter.extend({
    namespace: 'epi',
    bootstrap: 'assets/storage.sample.json',

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
