import Ember from 'ember';

var RSVP = Ember.RSVP,
    a_slice = [].slice;

/**
 * Invokes the first callable function on each element of `array`.
 *
 * @function invoke
 * @param {Array} array       Objects to invoke the function on
 * @param {Array} methodNames Methods to try in turn
 * @param {Any*} args         Extra arguments
 * @return {Array}            Return values of the invocations
 */
var invoke = function(array, methodNames) {
    var args, ret = Ember.A();
    if (arguments.length>2) args = a_slice.call(arguments, 2);

    array.forEach(function(x, idx) {
        var methodName = methodNames.find(function(name) {
            var method = x && x[methodName];
            return typeof method === 'function';
        });
        if (methodName !== undefined) {
            ret[idx] = args ? x[methodName].apply(x, args) : x[methodName].call(x);
        }
    });

    return ret;
};

export default Ember.Mixin.create({
    destroyRecordRecursively: function() {
        var record = this,
            promises = [];
        this.eachRelationship(function(key, relationship) {
            if (relationship.kind === 'hasMany') {
                var promise = RSVP.Promise.cast(record.get(key))
                        .then(function(recordArray) {
                            var records = recordArray.toArray();
                            // detach the records
                            recordArray.clear();
                            return records;
                        });
                // start a new promise branch, for deleting
                promise.then(function(records) {
                    invoke(records, ['destroyRecordRecursively',
                                     'destroyRecord']);
                });

                promises.push(promise);
            }
        });

        return RSVP.all(promises)
            .then(function() {
                return record.destroyRecord();
            });
    }
});
