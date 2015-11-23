
import {isObject} from './objects'
import {slice, flatten} from './arrays'
import {callFunc, nextTick} from './utils'

export interface IPromise<T> extends Thenable<T> {

}

export const Promise: PromiseConstructor = (typeof window === 'undefined') ? global.Promise : (<any>window).Promise;

export interface Thenable<R> {
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
		catch<U>(onRejected?: (error: any) => U | Thenable<U>): IPromise<U>;
}

export interface PromiseConstructor {
	new <R>(callback: (resolve: (value?: R | Thenable<R>) => void, reject: (error?: any) => void) => void): IPromise<R>
	resolve<R>(value?: R | Thenable<R>): IPromise<R>;
	reject(error: any): IPromise<any>;
	all<R>(promises: (R | Thenable<R>)[]): IPromise<R[]>;
	race<R>(promises: (R | Thenable<R>)[]): IPromise<R>;
}





// Promises
export function isPromise(obj): boolean {
	return obj && typeof obj.then === 'function';
}

export function toPromise(obj) {
	/* jshint validthis:true */
	if (!obj) {
		return obj;
	} if (isPromise(obj)) {
		return obj;
	} if ("function" == typeof obj) {
		return thunkToPromise.call(this, obj);
	} if (Array.isArray(obj)) {
		return arrayToPromise.call(this, obj);
	} if (isObject(obj)) {
		return objectToPromise.call(this, obj);
	} return Promise.resolve(obj);
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
	return new Promise(function(resolve, reject) {
		fn.call(ctx, function(err, res) {
			if (err) return reject(err);
			if (arguments.length > 2) res = slice(arguments, 1);
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
		if (promise && isPromise(promise)) defer(promise, key); else results[key] = obj[key];
	}
	return Promise.all(promises).then(function() {
		return results;
	});

	function defer(promise, key) {
		// predefine the key in the result
		results[key] = undefined;
		promises.push(promise.then(function(res) {
			results[key] = res;
		}));
	}
}

export interface Deferred<T> {
	promise: IPromise<T>
	resolve: (result: T) => void
	reject: (error: Error) => void
	done: (error: Error, result: T) => void
}

export function deferred<T>(fn?, ctx?, ...args: any[]): Deferred<T>|IPromise<T> {
	let ret: any = {};
	ret.promise = new Promise(function(resolve, reject) {
		ret.resolve = resolve;
		ret.reject = reject;
		ret.done = function(err, result) { if (err) return reject(err); else resolve(result); };
	});

	if (typeof fn === 'function') {
		callFunc(fn,ctx,args.concat([ret.done]))
		return ret.promise;
	}
	return ret;

};

export function callback<T>(promise: IPromise<T>, callback: (error: Error, result: T) => void, ctx?: any) {
	promise.then(function(result) {
		callback.call(ctx, null, result);
	}).catch(function(err) {
		callback.call(ctx, err);
	});
}

export function delay<T>(timeout?:number): IPromise<T> {
	let defer: Deferred<T> = <Deferred<T>>deferred();
	timeout == null ? nextTick(defer.resolve) : setTimeout(defer.resolve, timeout)
	return defer.promise;
};


export function eachAsync<T>(array: T[], iterator: (value: T) => IPromise<void>, context?: any, accumulate = false): IPromise<void> {

  return mapAsync<T, void>(array, iterator, context, accumulate)
    .then(function() { return void 0; })

}

export function mapAsync<T, U>(array: T[], iterator: (value: T) => IPromise<U>, context?: any, accumulate = false): IPromise<U[]> {

  return new Promise<U[]>(function(resolve, reject) {
    let i = 0, len = array.length,
      errors = [], results: U[] = [];
    function next(err, result?: any) {
      if (err && !accumulate) return reject(err);
      if (err) errors.push(err);
      if (i === len)
        return errors.length ? reject(flatten(errors)) : resolve(results);

      let ret = iterator.call(context, array[i++]);

      if (isPromise(ret)) {
        ret.then(function(r) { results.push(r); next(null, r); }, next);
      } else if (ret instanceof Error) {
        next(ret);
      } else {
        next(null);
      }
    }

    next(null);

  });

}