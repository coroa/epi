import Em from 'ember';

export default function(path, fallbackPath) {
    return Em.computed(function(key, newValue, cachedValue) {
        if (arguments.length === 1) {
            // getter
            var val = this.get(path);
            return !Em.isNone(val) ? val
                : this.get(fallbackPath);
        } else if(newValue != cachedValue) {
            // setter
            this.set(path, newValue);
            return newValue;
        } else {
            return cachedValue;
        }
    }).property(path, fallbackPath);
}
