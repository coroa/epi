
export default DS.JSONSerializer.extend({
    normalize: function(type, hash) {
        hash = this._super(type, hash);
        hash.value = hash.value * Math.random(100);
        return hash;
    }
});
