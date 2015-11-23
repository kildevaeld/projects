var utils_1 = require('./utils');
var arrays_1 = require('./arrays');
function isObject(obj) {
    return obj === Object(obj);
}
exports.isObject = isObject;
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
exports.isEmpty = isEmpty;
function extend(obj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!isObject(obj))
        return obj;
    var o, k;
    for (var _a = 0; _a < args.length; _a++) {
        o = args[_a];
        if (!isObject(o))
            continue;
        for (k in o) {
            if (has(o, k))
                obj[k] = o[k];
        }
    }
    return obj;
}
exports.extend = extend;
function assign(target) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
    }
    var to = Object(target);
    for (var i = 0, ii = args.length; i < ii; i++) {
        var nextSource = args[i];
        if (nextSource === undefined || nextSource === null) {
            continue;
        }
        nextSource = Object(nextSource);
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }
    return to;
}
exports.assign = assign;
function has(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
exports.has = has;
function pick(obj, props) {
    var out = {}, prop;
    for (var _i = 0; _i < props.length; _i++) {
        prop = props[_i];
        if (has(obj, prop))
            out[prop] = obj[prop];
    }
    return out;
}
exports.pick = pick;
function result(obj, prop, ctx, args) {
    var ret = obj[prop];
    return (typeof ret === 'function') ? utils_1.callFunc(ret, ctx, args || []) : ret;
}
exports.result = result;
function values(obj) {
    var output = [];
    for (var k in obj)
        if (has(obj, k)) {
            output.push(obj[k]);
        }
    return output;
}
exports.values = values;
function intersectionObjects(a, b, predicate) {
    var results = [], aElement, existsInB;
    for (var i = 0, ii = a.length; i < ii; i++) {
        aElement = a[i];
        existsInB = arrays_1.any(b, function (bElement) { return predicate(bElement, aElement); });
        if (existsInB) {
            results.push(aElement);
        }
    }
    return results;
}
function intersection(results) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var lastArgument = args[args.length - 1];
    var arrayCount = args.length;
    var areEqualFunction = utils_1.equal;
    if (typeof lastArgument === "function") {
        areEqualFunction = lastArgument;
        arrayCount--;
    }
    for (var i = 0; i < arrayCount; i++) {
        var array = args[i];
        results = intersectionObjects(results, array, areEqualFunction);
        if (results.length === 0)
            break;
    }
    return results;
}
exports.intersection = intersection;
