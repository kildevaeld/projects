import { isObject } from './objects';
import { slice, flatten } from './arrays';
import { callFunc, nextTick } from './utils';
export const Promise = window.Promise;
// Promises
export function isPromise(obj) {
    return obj && typeof obj.then === 'function';
}
export function toPromise(obj) {
    /* jshint validthis:true */
    if (!obj) {
        return obj;
    }
    if (isPromise(obj)) {
        return obj;
    }
    if ("function" == typeof obj) {
        return thunkToPromise.call(this, obj);
    }
    if (Array.isArray(obj)) {
        return arrayToPromise.call(this, obj);
    }
    if (isObject(obj)) {
        return objectToPromise.call(this, obj);
    }
    return Promise.resolve(obj);
}
/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */
export function thunkToPromise(fn) {
    /* jshint validthis:true */
    var ctx = this;
    return new Promise(function (resolve, reject) {
        fn.call(ctx, function (err, res) {
            if (err)
                return reject(err);
            if (arguments.length > 2)
                res = slice(arguments, 1);
            resolve(res);
        });
    });
}
/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */
export function arrayToPromise(obj) {
    return Promise.all(obj.map(toPromise, this));
}
/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */
export function objectToPromise(obj) {
    var results = new obj.constructor();
    var keys = Object.keys(obj);
    var promises = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var promise = toPromise.call(this, obj[key]);
        if (promise && isPromise(promise))
            defer(promise, key);
        else
            results[key] = obj[key];
    }
    return Promise.all(promises).then(function () {
        return results;
    });
    function defer(promise, key) {
        // predefine the key in the result
        results[key] = undefined;
        promises.push(promise.then(function (res) {
            results[key] = res;
        }));
    }
}
export function deferred(fn, ctx, ...args) {
    let ret = {};
    ret.promise = new Promise(function (resolve, reject) {
        ret.resolve = resolve;
        ret.reject = reject;
        ret.done = function (err, result) { if (err)
            return reject(err);
        else
            resolve(result); };
    });
    if (typeof fn === 'function') {
        callFunc(fn, ctx, args.concat([ret.done]));
        return ret.promise;
    }
    return ret;
}
;
export function callback(promise, callback, ctx) {
    promise.then(function (result) {
        callback.call(ctx, null, result);
    }).catch(function (err) {
        callback.call(ctx, err);
    });
}
export function delay(timeout) {
    let defer = deferred();
    timeout == null ? nextTick(defer.resolve) : setTimeout(defer.resolve, timeout);
    return defer.promise;
}
;
export function eachAsync(array, iterator, context, accumulate = false) {
    return mapAsync(array, iterator, context, accumulate)
        .then(function () { return void 0; });
}
export function mapAsync(array, iterator, context, accumulate = false) {
    return new Promise(function (resolve, reject) {
        let i = 0, len = array.length, errors = [], results = [];
        function next(err, result) {
            if (err && !accumulate)
                return reject(err);
            if (err)
                errors.push(err);
            if (i === len)
                return errors.length ? reject(flatten(errors)) : resolve(results);
            let ret = iterator.call(context, array[i++]);
            if (isPromise(ret)) {
                ret.then(function (r) { results.push(r); next(null, r); }, next);
            }
            else if (ret instanceof Error) {
                next(ret);
            }
            else {
                next(null);
            }
        }
        next(null);
    });
}
