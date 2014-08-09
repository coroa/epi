import Ember from 'ember';

/**
 `D3EmberComputed` wraps a reusable element (in the d3 way) to update,
 when any of the properties listed in `dependentKeys` on Ember
 Object-based data trigger an update.


 @method D3EmberComputed
 @param {String} dependentKeys*
 @param {Reusable D3 element} the element
 @return {Reusable D3 element} the wrapped element
 */

export default function D3EmberComputed() {
    var dependentKeys = Array.prototype.slice.call(arguments, 0, -1),
        d3class = arguments[arguments.length - 1],
        observers = {};

    return function constructor(id) {
        if (arguments.length === 0) {
            id = 'main';
        }
        var d3object = d3class.apply(this, Array.prototype.slice.call(arguments, 1)),
            observer;

        // Reuse the same observer, for the same constructor to
        // guarantee that we will not produce duplicate signups for
        // being observer
        if (id in observers) {
            observer = observers[id];
        } else {
            observer = observers[id] = {
                onChange: function() {
                    this.timer = Ember.run.scheduleOnce('afterRender', this, 'doUpdate');
                },
                doUpdate: function() {
                    d3object.call(this.selection, this.selection);
                }
            };
        }

        function exports(selection) {
            if (observer.timer) {
                Ember.run.cancel(observer.timer);
                observer.timer = null;
            }
            observer.selection = selection;
            selection.each(function(data) {
                if ('addObserver' in data) {
                    dependentKeys.forEach(function(depKey) {
                        data.addObserver(depKey, observer, 'onChange');
                    });
                }
            });

            return d3object.call(this, selection);
        }

        // Make the d3 elements configuration functions accessible, by
        // the wrapping function
        for (var prop in d3object) {
            if (d3object.hasOwnProperty(prop) && typeof(d3object[prop]) === 'function') {
                exports[prop] = d3object[prop];
            }
        }

        return exports;
    };
}
