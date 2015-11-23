import {callFunc} from 'utilities';

function _log () {
	// this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

var _debug = false;

export function debug (should:boolean) {
  _debug = should
}

var formatters: {[key:string]: Function} = {
  j: function (v:any):string {
    return JSON.stringify(v);
  }
}

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

export function logger (namespace:string) {
	let fn = function (...args:any[]) {

    if (!_debug) return;


    args[0] = coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    args = formatArgs(namespace, args);

    callFunc(_log,null, args);
	}

  return fn;
}

function formatArgs (namespace:string, args:any[]) {
  //var args = arguments;

  args[0] = '[views:' + namespace + '] ' + args[0]

  return args;
}