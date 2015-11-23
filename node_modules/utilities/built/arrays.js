import { equal } from './utils';
export function unique(array) {
    return array.filter(function (e, i) {
        for (i += 1; i < array.length; i += 1) {
            if (equal(e, array[i])) {
                return false;
            }
        }
        return true;
    });
}
export function any(array, predicate) {
    for (let i = 0, ii = array.length; i < ii; i++) {
        if (predicate(array[i]))
            return true;
    }
    return false;
}
export function indexOf(array, item) {
    for (var i = 0, len = array.length; i < len; i++)
        if (array[i] === item)
            return i;
    return -1;
}
export function find(array, callback, ctx) {
    let i, v;
    for (i = 0; i < array.length; i++) {
        v = array[i];
        if (callback.call(ctx, v))
            return v;
    }
    return null;
}
export function slice(array, begin, end) {
    return Array.prototype.slice.call(array, begin, end);
}
export function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}
export function sortBy(obj, value, context) {
    var iterator = typeof value === 'function' ? value : function (obj) { return obj[value]; };
    return obj
        .map(function (value, index, list) {
        return {
            value: value,
            index: index,
            criteria: iterator.call(context, value, index, list)
        };
    })
        .sort(function (left, right) {
        var a = left.criteria;
        var b = right.criteria;
        if (a !== b) {
            if (a > b || a === void 0)
                return 1;
            if (a < b || b === void 0)
                return -1;
        }
        return left.index - right.index;
    })
        .map(function (item) {
        return item.value;
    });
}
