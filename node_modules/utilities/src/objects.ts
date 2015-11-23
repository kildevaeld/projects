import {equal, callFunc} from './utils'
import {any} from './arrays'

export function isObject(obj: any): boolean {
  return obj === Object(obj);
}

export function isEmpty(obj:any): boolean {
  return Object.keys(obj).length === 0
}

export function extend(obj: Object, ...args: Object[]): any {
  if (!isObject(obj)) return obj
  let o, k
  for (o of args) {
    if (!isObject(o)) continue
    for (k in o) {
      if (has(o, k)) obj[k] = o[k]
    }
  }
  return obj
}

export function assign(target: any, ...args: any[]) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  var to = Object(target);
  for (let i=0,ii=args.length; i < ii; i++) {
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

export function has(obj, prop): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

export function pick(obj: Object, props: string[]): any {
  let out = {}, prop
  for (prop of props) {
    if (has(obj, prop)) out[prop] = obj[prop]
  }
  return out
}

export function result(obj: any, prop: string, ctx?: any, args?: any[]): any {
  let ret = obj[prop]
  return (typeof ret === 'function') ? callFunc(ret, ctx, args || []) : ret

}

export function values<T>(obj: Object): T[] {
  let output = []
  for (let k in obj) if (has(obj, k)) {
    output.push(obj[k])
  }
  return output
}

function intersectionObjects(a, b, predicate) {
  var results = [], aElement, existsInB;
  for (let i = 0, ii = a.length; i < ii; i++) {
    aElement = a[i];
    existsInB = any(b, function(bElement) { return predicate(bElement, aElement); });

    if (existsInB) {
      results.push(aElement);
    }
  }

  return results;
}

export function intersection(results: any[], ...args: any[]): any[] {
  var lastArgument = args[args.length - 1];
  var arrayCount = args.length;
  var areEqualFunction = equal;

  if (typeof lastArgument === "function") {
    areEqualFunction = lastArgument;
    arrayCount--;
  }

  for (var i = 0; i < arrayCount; i++) {
    var array = args[i];
    results = intersectionObjects(results, array, areEqualFunction);
    if (results.length === 0) break;
  }

  return results;

}