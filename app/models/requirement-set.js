import DS from 'ember-data';

var attr = DS.attr,
    hasMany = DS.hasMany;

export default DS.Model.extend({
    name: attr('string'),
    requirements: hasMany('requirement',
                          { embedded: 'onsave', async: true }),
    siaStorageVolumes: hasMany('sia-storage-volume',
                               { embedded: 'onsave', async: true })
});
