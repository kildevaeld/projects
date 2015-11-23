var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/*global View, RegionManager, Region*/
var templateview_1 = require('./templateview');
var region_manager_1 = require('./region-manager');
var utilities_1 = require('utilities');
var region_1 = require('./region');
var LayoutView = (function (_super) {
    __extends(LayoutView, _super);
    /**
     * LayoutView
     * @param {Object} options options
     * @constructor LayoutView
     * @extends TemplateView
     */
    function LayoutView(options) {
        // Set region manager
        this._regionManager = new region_manager_1.RegionManager();
        utilities_1.proxy(this, this._regionManager, ['removeRegion', 'removeRegions']);
        this._regions = this.getOption('regions', options || {});
        _super.call(this, options);
    }
    Object.defineProperty(LayoutView.prototype, "regions", {
        get: function () {
            return this._regionManager.regions;
        },
        enumerable: true,
        configurable: true
    });
    LayoutView.prototype.render = function (options) {
        this.triggerMethod('before:render');
        _super.prototype.render.call(this, { silent: true });
        this.addRegion(this._regions || {});
        this.triggerMethod('render');
        return this;
    };
    /**
     * Add one or more regions to the view
     * @param {string|RegionMap} name
     * @param {Object|string|HTMLElement} def
     */
    LayoutView.prototype.addRegion = function (name, def) {
        var regions = {};
        if (typeof name === 'string') {
            if (def == null)
                throw new Error('add region');
            regions[name] = def;
        }
        else {
            regions = name;
        }
        for (var k in regions) {
            var region = region_1.Region.buildRegion(regions[k], this.el);
            this._regionManager.addRegion(k, region);
        }
    };
    /**
     * Delete one or more regions from the the layoutview
     * @param {string|Array<string>} name
     */
    LayoutView.prototype.removeRegion = function (name) {
        this._regionManager.removeRegion(name);
    };
    LayoutView.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._regionManager.destroy();
    };
    return LayoutView;
})(templateview_1.TemplateView);
exports.LayoutView = LayoutView;
