var utilities_1 = require('utilities');
function _log() {
    // this hackery is required for IE8/9, where
    // the `console.log` function doesn't have 'apply'
    return 'object' === typeof console
        && console.log
        && Function.prototype.apply.call(console.log, console, arguments);
}
var _debug = false;
function debug(should) {
    _debug = should;
}
exports.debug = debug;
var formatters = {
    j: function (v) {
        return JSON.stringify(v);
    }
};
function coerce(val) {
    if (val instanceof Error)
        return val.stack || val.message;
    return val;
}
function logger(namespace) {
    var fn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!_debug)
            return;
        args[0] = coerce(args[0]);
        if ('string' !== typeof args[0]) {
            // anything else let's inspect with %o
            args = ['%o'].concat(args);
        }
        // apply any `formatters` transformations
        var index = 0;
        args[0] = args[0].replace(/%([a-z%])/g, function (match, format) {
            // if we encounter an escaped % then don't increase the array index
            if (match === '%%')
                return match;
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
        utilities_1.callFunc(_log, null, args);
    };
    return fn;
}
exports.logger = logger;
function formatArgs(namespace, args) {
    //var args = arguments;
    args[0] = '[views:' + namespace + '] ' + args[0];
    return args;
}
