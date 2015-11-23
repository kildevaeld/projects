/// <reference path="typings" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var eventsjs_1 = require('eventsjs');
var utilities_1 = require('utilities');
var debug_1 = require('./debug');
var debug = debug_1.logger('object');
/** Base object */
var BaseObject = (function (_super) {
    __extends(BaseObject, _super);
    /**
     * Object
     * @extends EventEmitter
     */
    function BaseObject(args) {
        _super.call(this);
        this._isDestroyed = false;
        if (typeof this.initialize === 'function') {
            utilities_1.callFunc(this.initialize, this, utilities_1.slice(arguments));
        }
    }
    Object.defineProperty(BaseObject.prototype, "isDestroyed", {
        /**
         * Whether the object is "destroyed" or not
         * @type boolean
         */
        get: function () {
            return this._isDestroyed;
        },
        enumerable: true,
        configurable: true
    });
    BaseObject.prototype.destroy = function () {
        if (this.isDestroyed)
            return this;
        this.triggerMethod('before:destroy');
        this.stopListening();
        this.off();
        this._isDestroyed = true;
        this.triggerMethod('destroy');
        debug("%s destroy", this);
        if (typeof Object.freeze) {
            Object.freeze(this);
        }
        return this;
    };
    BaseObject.prototype.triggerMethod = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        utilities_1.triggerMethodOn(this, eventName, args);
        return this;
    };
    BaseObject.prototype.getOption = function (prop) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.options) {
            args.push(this.options);
        }
        if (this._options) {
            args.push(this._options);
        }
        args.push(this);
        return utilities_1.getOption(prop, args);
    };
    BaseObject.extend = function (proto, stat) {
        return utilities_1.inherits(this, proto, stat);
    };
    return BaseObject;
})(eventsjs_1.EventEmitter);
exports.BaseObject = BaseObject;
