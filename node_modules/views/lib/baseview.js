/// <reference path="typings" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var object_1 = require('./object');
var utils = require('utilities');
var debug_1 = require('./debug');
var debug = debug_1.logger('baseview');
var paddedLt = /^\s*</;
var unbubblebles = 'focus blur change'.split(' ');
var viewOptions = ['el', 'id', 'attributes', 'className', 'tagName', 'events'];
var BaseView = (function (_super) {
    __extends(BaseView, _super);
    /**
     * BaseView
     * @param {BaseViewOptions} options
     * @extends BaseObject
     */
    function BaseView(options) {
        if (options === void 0) { options = {}; }
        this._cid = utils.uniqueId('view');
        utils.extend(this, utils.pick(options, viewOptions));
        this._domEvents = [];
        if (this.el == null) {
            this._ensureElement();
        }
        else {
            this.delegateEvents();
        }
        _super.call(this, options);
    }
    BaseView.find = function (selector, context) {
        return context.querySelectorAll(selector);
    };
    Object.defineProperty(BaseView.prototype, "cid", {
        get: function () {
            return this._cid;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Delegate events
     * @param {EventsMap} events
     */
    BaseView.prototype.delegateEvents = function (events) {
        var _this = this;
        if (!(events || (events = utils.result(this, 'events'))))
            return this;
        this.undelegateEvents();
        var dels = [];
        for (var key in events) {
            var method = events[key];
            if (typeof method !== 'function')
                method = this[method];
            var match = key.match(/^(\S+)\s*(.*)$/);
            // Set delegates immediately and defer event on this.el
            var boundFn = utils.bind(method, this);
            if (match[2]) {
                this.delegate(match[1], match[2], boundFn);
            }
            else {
                dels.push([match[1], boundFn]);
            }
        }
        dels.forEach(function (d) { _this.delegate(d[0], d[1]); });
        return this;
    };
    /**
     * Undelegate events
     */
    BaseView.prototype.undelegateEvents = function () {
        if (this.el) {
            for (var i = 0, len = this._domEvents.length; i < len; i++) {
                var item = this._domEvents[i];
                utils.removeEventListener(this.el, item.eventName, item.handler);
            }
            this._domEvents.length = 0;
        }
        return this;
    };
    BaseView.prototype.delegate = function (eventName, selector, listener) {
        if (typeof selector === 'function') {
            listener = selector;
            selector = null;
        }
        var root = this.el;
        var handler = selector ? function (e) {
            var node = e.target || e.srcElement;
            // Already handled
            if (e.delegateTarget)
                return;
            for (; node && node != root; node = node.parentNode) {
                if (utils.matches(node, selector)) {
                    e.delegateTarget = node;
                    listener(e);
                }
            }
        } : function (e) {
            if (e.delegateTarget)
                return;
            listener(e);
        };
        /*jshint bitwise: false*/
        var useCap = !!~unbubblebles.indexOf(eventName) && selector != null;
        debug('%s delegate event %s ', this.cid, eventName);
        utils.addEventListener(this.el, eventName, handler, useCap);
        this._domEvents.push({ eventName: eventName, handler: handler, listener: listener, selector: selector });
        return handler;
    };
    BaseView.prototype.undelegate = function (eventName, selector, listener) {
        if (typeof selector === 'function') {
            listener = selector;
            selector = null;
        }
        if (this.el) {
            var handlers = this._domEvents.slice();
            for (var i = 0, len = handlers.length; i < len; i++) {
                var item = handlers[i];
                var match = item.eventName === eventName &&
                    (listener ? item.listener === listener : true) &&
                    (selector ? item.selector === selector : true);
                if (!match)
                    continue;
                utils.removeEventListener(this.el, item.eventName, item.handler);
                this._domEvents.splice(utils.indexOf(handlers, item), 1);
            }
        }
        return this;
    };
    BaseView.prototype.render = function (options) {
        return this;
    };
    /**
     * Append the view to a HTMLElement
     * @param {HTMLElement|string} elm A html element or a selector string
     * @return {this} for chaining
     */
    BaseView.prototype.appendTo = function (elm) {
        if (elm instanceof HTMLElement) {
            elm.appendChild(this.el);
        }
        else {
            var el = document.querySelector(elm);
            el ? el.appendChild(this.el) : void 0;
        }
        return this;
    };
    /**
     * Append a element the view
     * @param {HTMLElement} elm
     * @param {String} toSelector
     * @return {this} for chaining
     */
    BaseView.prototype.append = function (elm, toSelector) {
        if (toSelector != null) {
            var ret = this.$(toSelector);
            if (ret instanceof NodeList && ret.length > 0) {
                ret[0].appendChild(elm);
            }
            else if (ret instanceof HTMLElement) {
                ret.appendChild(elm);
            }
        }
        else {
            this.el.appendChild(elm);
        }
        return this;
    };
    /**
     * Convience for view.el.querySelectorAll()
     * @param {string|HTMLElement} selector
     */
    BaseView.prototype.$ = function (selector) {
        if (selector instanceof HTMLElement) {
            return selector;
        }
        else {
            return BaseView.find(selector, this.el);
        }
    };
    BaseView.prototype.setElement = function (elm) {
        this.undelegateEvents();
        this._setElement(elm);
        this.delegateEvents();
    };
    BaseView.prototype.remove = function () {
        this._removeElement();
        return this;
    };
    BaseView.prototype._createElement = function (tagName) {
        return document.createElement(tagName);
    };
    BaseView.prototype._ensureElement = function () {
        if (!this.el) {
            var attrs = utils.extend({}, utils.result(this, 'attributes'));
            if (this.id)
                attrs.id = utils.result(this, 'id');
            if (this.className)
                attrs['class'] = utils.result(this, 'className');
            debug('%s created element: %s', this.cid, utils.result(this, 'tagName') || 'div');
            this.setElement(this._createElement(utils.result(this, 'tagName') || 'div'));
            this._setAttributes(attrs);
        }
        else {
            this.setElement(utils.result(this, 'el'));
        }
    };
    BaseView.prototype._removeElement = function () {
        this.undelegateEvents();
        if (this.el.parentNode)
            this.el.parentNode.removeChild(this.el);
    };
    BaseView.prototype._setElement = function (element) {
        if (typeof element === 'string') {
            if (paddedLt.test(element)) {
                var el = document.createElement('div');
                el.innerHTML = element;
                this.el = el.firstElementChild;
            }
            else {
                this.el = document.querySelector(element);
            }
        }
        else {
            this.el = element;
        }
    };
    BaseView.prototype._setAttributes = function (attrs) {
        for (var attr in attrs) {
            attr in this.el ? this.el[attr] = attrs[attr] : this.el.setAttribute(attr, attrs[attr]);
        }
    };
    return BaseView;
})(object_1.BaseObject);
exports.BaseView = BaseView;
