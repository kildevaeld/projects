/* global BaseClass */
/* jshint latedef:nofunc */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var object_1 = require('./object');
var utilities_1 = require('utilities');
/** Region  */
var Region = (function (_super) {
    __extends(Region, _super);
    /**
     * Regions manage a view
     * @param {Object} options
     * @param {HTMLElement} options.el  A Html element
     * @constructor Region
     * @extends BaseObject
     * @inheritdoc
     */
    function Region(options) {
        this.options = options;
        this._el = this.getOption('el');
        _super.call(this);
    }
    Object.defineProperty(Region.prototype, "view", {
        get: function () {
            return this._view;
        },
        set: function (view) {
            this.show(view);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Region.prototype, "el", {
        get: function () {
            return this._el;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Build region from a definition
     * @param {Object|String|Region} def The description of the region
     * @return {Region}
     */
    Region.buildRegion = function (def, context) {
        if (context === void 0) { context = null; }
        if (def instanceof Region) {
            return def;
        }
        else if (typeof def === 'string') {
            return buildBySelector(def, Region, context);
        }
        else {
            return buildByObject(def, context);
        }
    };
    /**
   * Show a view in the region.
   * This will destroy or remove any existing views.
   * @param  {View} view    The view to Show
   * @return {Region}       this for chaining.
   */
    Region.prototype.show = function (view, options) {
        var diff = view !== this._view;
        if (diff) {
            // Remove any containing views
            this.empty();
            // If the view is destroyed be others
            view.once('destroy', this.empty, this);
            view.render();
            utilities_1.triggerMethodOn(view, 'before:show');
            this._attachHtml(view);
            utilities_1.triggerMethodOn(view, 'show');
            this._view = view;
        }
        return this;
    };
    /**
     * Destroy the region, this will remove any views, but not the containing element
     * @return {Region} this for chaining
     */
    Region.prototype.destroy = function () {
        this.empty();
        _super.prototype.destroy.call(this);
    };
    /**
     * Empty the region. This will destroy any existing view.
     * @return {Region} this for chaining;
     */
    Region.prototype.empty = function () {
        if (!this._view)
            return;
        var view = this._view;
        view.off('destroy', this.empty, this);
        this.trigger('before:empty', view);
        this._destroyView();
        this.trigger('empty', view);
        delete this._view;
        return this;
    };
    /**
     * Attach the view element to the regions element
     * @param {View} view
     * @private
     *
     */
    Region.prototype._attachHtml = function (view) {
        this._el.innerHTML = '';
        this._el.appendChild(view.el);
    };
    Region.prototype._destroyView = function () {
        var view = this._view;
        if ((view.destroy && typeof view.destroy === 'function') && !view.isDestroyed) {
            view.destroy();
        }
        else if (view.remove && typeof view.remove === 'function') {
            view.remove();
        }
        this._el.innerHTML = '';
    };
    return Region;
})(object_1.BaseObject);
exports.Region = Region;
function buildByObject(object, context) {
    if (object === void 0) { object = {}; }
    if (!object.selector)
        throw new Error('No selector specified: ' + object);
    return buildBySelector(object.selector, object.regionClass || Region, context);
}
function buildBySelector(selector, Klass, context) {
    if (Klass === void 0) { Klass = Region; }
    context = context || document;
    var el = context.querySelector(selector);
    if (!el)
        throw new Error('selector must exist in the dom');
    return new Klass({
        el: el
    });
}
