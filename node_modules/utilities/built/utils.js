import { has, isObject, extend } from './objects';
import { slice } from './arrays';
var idCounter = 0;
const nativeBind = Function.prototype.bind;
export function camelcase(input) {
    return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
        return group1.toUpperCase();
    });
}
;
/** Generate an unique id with an optional prefix
 * @param {string} prefix
 * @return {string}
 */
export function uniqueId(prefix = '') {
    return prefix + (++idCounter);
}
export function proxy(from, to, fns) {
    if (!Array.isArray(fns))
        fns = [fns];
    fns.forEach(function (fn) {
        if (typeof to[fn] === 'function') {
            from[fn] = bind(to[fn], to);
        }
    });
}
export function bind(method, context, ...args) {
    if (typeof method !== 'function')
        throw new Error('method not at function');
    if (nativeBind != null)
        return nativeBind.call(method, context, ...args);
    args = args || [];
    let fnoop = function () { };
    let fBound = function () {
        let ctx = this instanceof fnoop ? this : context;
        return callFunc(method, ctx, args.concat(slice(arguments)));
    };
    fnoop.prototype = this.prototype;
    fBound.prototype = new fnoop();
    return fBound;
}
export function callFunc(fn, ctx, args = []) {
    switch (args.length) {
        case 0:
            return fn.call(ctx);
        case 1:
            return fn.call(ctx, args[0]);
        case 2:
            return fn.call(ctx, args[0], args[1]);
        case 3:
            return fn.call(ctx, args[0], args[1], args[2]);
        case 4:
            return fn.call(ctx, args[0], args[1], args[2], args[3]);
        case 5:
            return fn.call(ctx, args[0], args[1], args[2], args[3], args[4]);
        default:
            return fn.apply(ctx, args);
    }
}
export function equal(a, b) {
    return eq(a, b, [], []);
}
export function triggerMethodOn(obj, eventName, args) {
    let ev = camelcase("on-" + eventName.replace(':', '-'));
    if (obj[ev] && typeof obj[ev] === 'function') {
        callFunc(obj[ev], obj, args);
    }
    if (typeof obj.trigger === 'function') {
        args = [eventName].concat(args);
        callFunc(obj.trigger, obj, args);
    }
}
export function getOption(option, objs) {
    for (let o of objs) {
        if (isObject(o) && o[option])
            return o[option];
    }
    return null;
}
export function inherits(parent, protoProps, staticProps) {
    //var parent = this;
    var child;
    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    }
    else {
        child = function () { return parent.apply(this, arguments); };
    }
    // Add static properties to the constructor function, if supplied.
    extend(child, parent, staticProps);
    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function () { this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;
    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps)
        extend(child.prototype, protoProps);
    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;
    return child;
}
export const nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener;
    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f); };
    }
    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }
    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();
function eq(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b)
        return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null)
        return a === b;
    // Unwrap any wrapped objects.
    //if (a instanceof _) a = a._wrapped;
    //if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b))
        return false;
    switch (className) {
        // Strings, numbers, dates, and booleans are compared by value.
        case '[object String]':
            // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
            // equivalent to `new String("5")`.
            return a == String(b);
        case '[object Number]':
            // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
            // other numeric values.
            return a !== +a ? b !== +b : (a === 0 ? 1 / a === 1 / b : a === +b);
        case '[object Date]':
        case '[object Boolean]':
            // Coerce dates and booleans to numeric primitive values. Dates are compared by their
            // millisecond representations. Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a == +b;
        // RegExps are compared by their source patterns and flags.
        case '[object RegExp]':
            return a.source == b.source &&
                a.global == b.global &&
                a.multiline == b.multiline &&
                a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object')
        return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] == a)
            return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(typeof aCtor === 'function' && (aCtor instanceof aCtor) &&
        typeof bCtor === 'function' && (bCtor instanceof bCtor))) {
        return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = a.length;
        result = size === b.length;
        if (result) {
            // Deep compare the contents, ignoring non-numeric properties.
            while (size--) {
                if (!(result = eq(a[size], b[size], aStack, bStack)))
                    break;
            }
        }
    }
    else {
        // Deep compare objects.
        for (var key in a) {
            if (has(a, key)) {
                // Count the expected number of properties.
                size++;
                // Deep compare each member.
                if (!(result = has(b, key) && eq(a[key], b[key], aStack, bStack)))
                    break;
            }
        }
        // Ensure that both objects contain the same number of properties.
        if (result) {
            for (key in b) {
                if (has(b, key) && !(size--))
                    break;
            }
            result = !size;
        }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
}
;
