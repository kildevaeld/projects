/* global BaseClass, __has */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var object_1 = require('./object');
var region_1 = require('./region');
var utils = require('utilities');
var RegionManager = (function (_super) {
    __extends(RegionManager, _super);
    /** Region manager
     * @extends BaseObject
     */
    function RegionManager() {
        _super.call(this);
        this._regions = {};
    }
    Object.defineProperty(RegionManager.prototype, "regions", {
        /**
         * Regions
         * @type {string:Region}
         */
        get: function () {
            return this._regions;
        },
        enumerable: true,
        configurable: true
    });
    /**
      * Add one or more regions to the region manager
      * @param {Object} regions
      */
    RegionManager.prototype.addRegions = function (regions) {
        var def, out = {}, keys = Object.keys(regions);
        keys.forEach(function (k) {
            def = regions[k];
            out[k] = this.addRegion(k, def);
        }, this);
        return out;
    };
    /**
     * Add a region to the RegionManager
     * @param {String} name   The name of the regions
     * @param {String|Object|Region|HTMLElement} def The region to associate with the name and the RegionManager
     */
    RegionManager.prototype.addRegion = function (name, def) {
        var region = region_1.Region.buildRegion(def);
        this._setRegion(name, region);
        return region;
    };
    /**
     * Remove one or more regions from the manager
     * @param {...name} name A array of region names
     */
    RegionManager.prototype.removeRegion = function (names) {
        //let names = utils.slice(arguments)
        if (typeof names === 'string') {
            names = [names];
        }
        names.forEach(function (name) {
            if (utils.has(this.regions, name)) {
                var region = this.regions[name];
                region.destroy();
                this._unsetRegion(name);
            }
        }, this);
    };
    /**
     * Destroy the regionmanager
     */
    RegionManager.prototype.destroy = function () {
        this.removeRegions();
        _super.prototype.destroy.call(this);
    };
    /**
     * Remove all regions from the manager
     */
    RegionManager.prototype.removeRegions = function () {
        utils.callFunc(this.removeRegion, this, Object.keys(this._regions));
    };
    /**
     * @private
     */
    RegionManager.prototype._setRegion = function (name, region) {
        if (this._regions[name]) {
            this._regions[name].destroy();
        }
        this._regions[name] = region;
    };
    /**
     * @private
     */
    RegionManager.prototype._unsetRegion = function (name) {
        delete this._regions[name];
    };
    return RegionManager;
})(object_1.BaseObject);
exports.RegionManager = RegionManager;
