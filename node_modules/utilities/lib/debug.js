var utils_1 = require('./utils');
var Debug = (function () {
    function Debug(namespace) {
        this.enabled = false;
        this.namespace = namespace;
    }
    Debug.enable = function (enabled, namespace) {
        for (var k in this.loggers) {
            if (namespace && k === namespace) {
                this.loggers[k].enabled = enabled;
            }
            else if (!namespace) {
                this.loggers[k].enabled = enabled;
            }
        }
    };
    Debug.create = function (namespace) {
        var logger;
        if (this.loggers[namespace]) {
            logger = this.loggers[namespace].debug;
        }
        else {
            logger = new Debug(namespace);
            this.loggers[namespace] = logger;
        }
        return utils_1.bind(logger.debug, logger);
    };
    Debug.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!this.enabled)
            return;
        args[0] = this._coerce(args[0]);
        if ('string' !== typeof args[0]) {
            args = ['%o'].concat(args);
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-z%])/g, function (match, format) {
            if (match === '%%')
                return match;
            index++;
            var formatter = Debug.formatters[format];
            if ('function' === typeof formatter) {
                var val = args[index];
                match = formatter.call(self, val);
                args.splice(index, 1);
                index--;
            }
            return match;
        });
        args = this._formatArgs(args);
        this._log.apply(this, args);
    };
    Debug.prototype._log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return 'object' === typeof console
            && console.log
            && Function.prototype.apply.call(console.log, console, arguments);
    };
    Debug.prototype._coerce = function (val) {
        if (val instanceof Error)
            return val.stack || val.message;
        return val;
    };
    Debug.prototype._formatArgs = function (args) {
        var p = this.prefix ? this.prefix + ":" : '';
        args[0] = "[" + p + ":" + this.namespace + "] " + args[0];
        return args;
    };
    Debug.loggers = {};
    Debug.formatters = {
        j: function (args) {
            return JSON.stringify(args);
        }
    };
    return Debug;
})();
exports.Debug = Debug;
function debug(namespace) {
    return Debug.create(namespace);
}
exports.debug = debug;
