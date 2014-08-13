import DS from 'ember-data';
import DestroyRecursivelyMixin from '../mixins/destroy-recursively';

var attr = DS.attr,
    hasMany = DS.hasMany;

export default DS.Model.extend(DestroyRecursivelyMixin, {
    name: attr('string'),
    requirements: hasMany('requirement',
                          { embedded: 'onsave', async: true }),
    siaStorageVolumes: hasMany('sia-storage-volume',
                               { embedded: 'onsave', async: true })
});
