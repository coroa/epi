export default function(array, item, key) {
    var value = item.get(key), i=0;
    while (i < array.length && array.objectAt(i).get(key) < value) { i ++; }
    return array.insertAt(i, item);
};
