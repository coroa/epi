import Ember from 'ember';
import Enums from '../enums';

export default Ember.ArrayController.extend({
    needs: ['levels'],
    guaranteeLength: function() {
        var controller = this,
            levels = this.get('controllers.levels'),
            temperatures = Enums.temperature.options,
            N = levels.get('length'),
            M = temperatures.length,
            store = this.store;

        if (N === 0) {return;}

        if (this.get('length') != N*M) {
            // purge all and refill
            Ember.RSVP.all(
                [].concat.apply([], temperatures.map(function(t) {
                    return levels.map(function(l) {
                        return store
                            .createRecord('sia-storage-volume',
                                          { level: l.get('model'),
                                            temperature: t.id,
                                            storage_volume: null})
                            .save();
                    });
                })))
            .then(function(items) {
                controller.set('model', items);
                controller.send('setSiaStorageVolumes', items);
            });
        }
    }.observes('controllers.levels.[]').on('init')
});
