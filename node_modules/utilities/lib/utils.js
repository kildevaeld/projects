var objects_1 = require('./objects');
var arrays_1 = require('./arrays');
var strings_1 = require('./strings');
var idCounter = 0;
var nativeBind = Function.prototype.bind;
function ajax() {
    var e;
    if (window.hasOwnProperty('XMLHttpRequest')) {
        return new XMLHttpRequest();
    }
    try {
        return new ActiveXObject('msxml2.xmlhttp.6.0');
    }
    catch (_error) {
        e = _error;
    }
    try {
        return new ActiveXObject('msxml2.xmlhttp.3.0');
    }
    catch (_error) {
        e = _error;
    }
    try {
        return new ActiveXObject('msxml2.xmlhttp');
    }
    catch (_error) {
        e = _error;
    }
    return e;
}
exports.ajax = ajax;
;
function uniqueId(prefix) {
    if (prefix === void 0) { prefix = ''; }
    return prefix + (++idCounter);
}
exports.uniqueId = uniqueId;
function proxy(from, to, fns) {
    if (!Array.isArray(fns))
        fns = [fns];
    fns.forEach(function (fn) {
        if (typeof to[fn] === 'function') {
            from[fn] = bind(to[fn], to);
        }
    });
}
exports.proxy = proxy;
function bind(method, context) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (typeof method !== 'function')
        throw new Error('method not at function');
    if (nativeBind != null)
        return nativeBind.call.apply(nativeBind, [method, context].concat(args));
    args = args || [];
    var fnoop = function () { };
    var fBound = function () {
        var ctx = this instanceof fnoop ? this : context;
        return callFunc(method, ctx, args.concat(arrays_1.slice(arguments)));
    };
    fnoop.prototype = this.prototype;
    fBound.prototype = new fnoop();
    return fBound;
}
exports.bind = bind;
function callFunc(fn, ctx, args) {
    if (args === void 0) { args = []; }
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
exports.callFunc = callFunc;
function equal(a, b) {
    return eq(a, b, [], []);
}
exports.equal = equal;
function triggerMethodOn(obj, eventName, args) {
    var ev = strings_1.camelcase("on-" + eventName.replace(':', '-'));
    if (obj[ev] && typeof obj[ev] === 'function') {
        callFunc(obj[ev], obj, args);
    }
    if (typeof obj.trigger === 'function') {
        args = [eventName].concat(args);
        callFunc(obj.trigger, obj, args);
    }
}
exports.triggerMethodOn = triggerMethodOn;
function getOption(option, objs) {
    for (var _i = 0; _i < objs.length; _i++) {
        var o = objs[_i];
        if (objects_1.isObject(o) && o[option])
            return o[option];
    }
    return null;
}
exports.getOption = getOption;
function inherits(parent, protoProps, staticProps) {
    var child;
    if (protoProps && objects_1.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    }
    else {
        child = function () { return parent.apply(this, arguments); };
    }
    objects_1.extend(child, parent, staticProps);
    var Surrogate = function () { this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;
    if (protoProps)
        objects_1.extend(child.prototype, protoProps);
    child.__super__ = parent.prototype;
    return child;
}
exports.inherits = inherits;
exports.nextTick = (function () {
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
    if (a === b)
        return a !== 0 || 1 / a == 1 / b;
    if (a == null || b == null)
        return a === b;
    var className = toString.call(a);
    if (className != toString.call(b))
        return false;
    switch (className) {
        case '[object String]':
            return a == String(b);
        case '[object Number]':
            return a !== +a ? b !== +b : (a === 0 ? 1 / a === 1 / b : a === +b);
        case '[object Date]':
        case '[object Boolean]':
            return +a == +b;
        case '[object RegExp]':
            return a.source == b.source &&
                a.global == b.global &&
                a.multiline == b.multiline &&
                a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object')
        return false;
    var length = aStack.length;
    while (length--) {
        if (aStack[length] == a)
            return bStack[length] == b;
    }
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(typeof aCtor === 'function' && (aCtor instanceof aCtor) &&
        typeof bCtor === 'function' && (bCtor instanceof bCtor))) {
        return false;
    }
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    if (className === '[object Array]') {
        size = a.length;
        result = size === b.length;
        if (result) {
            while (size--) {
                if (!(result = eq(a[size], b[size], aStack, bStack)))
                    break;
            }
        }
    }
    else {
        for (var key in a) {
            if (objects_1.has(a, key)) {
                size++;
                if (!(result = objects_1.has(b, key) && eq(a[key], b[key], aStack, bStack)))
                    break;
            }
        }
        if (result) {
            for (key in b) {
                if (objects_1.has(b, key) && !(size--))
                    break;
            }
            result = !size;
        }
    }
    aStack.pop();
    bStack.pop();
    return result;
}
;
