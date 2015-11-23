var idCounter = 0;
var nativeBind = Function.prototype.bind;
exports.utils = {
    isObject: function (obj) {
        return true;
    },
    extend: function (obj) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!exports.utils.isObject(obj))
            return obj;
        var o, k;
        for (var _a = 0; _a < args.length; _a++) {
            o = args[_a];
            if (!exports.utils.isObject(o))
                continue;
            for (k in o) {
                if (exports.utils.has(o, k))
                    obj[k] = o[k];
            }
        }
        return obj;
    },
    pick: function (obj, props) {
        var out = {}, prop;
        for (var _i = 0; _i < props.length; _i++) {
            prop = props[_i];
            if (exports.utils.has(obj, prop))
                out[prop] = obj[prop];
        }
        return out;
    },
    has: function (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    },
    indexOf: function (array, item) {
        for (var i = 0, len = array.length; i < len; i++)
            if (array[i] === item)
                return i;
        return -1;
    },
    result: function (obj, prop, ctx, args) {
        var ret = obj[prop];
        return (typeof ret === 'function') ? exports.utils.call(ret, ctx, args || []) : ret;
    },
    bind: function (method, context) {
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
            return exports.utils.call(method, ctx, args.concat(exports.utils.slice(arguments)));
        };
        fnoop.prototype = this.prototype;
        fBound.prototype = new fnoop();
        return fBound;
    },
    call: function (fn, ctx, args) {
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
    },
    slice: function (array) {
        return Array.prototype.slice.call(array);
    },
    uniqueId: function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        return prefix + (++idCounter);
    }
};
