/* global BaseClass, __has */

import {BaseObject} from './object'
import {Region} from './region'
import * as utils from 'utilities'

export type RegionMap = {[key: string]: Region}

export class RegionManager extends BaseObject {
  private _regions: RegionMap = {}

  /**
   * Regions
   * @type {string:Region}
   */
  public get regions () {
    return this._regions
  }

  /** Region manager
   * @extends BaseObject
   */
  constructor () {
		super();
	}


  /**
    * Add one or more regions to the region manager
    * @param {Object} regions
    */
  addRegions (regions:RegionMap) {

    let def, out = {}, keys = Object.keys(regions);
    keys.forEach(function (k) {
      def = regions[k];
      out[k] = this.addRegion(k, def);
    }, this);
    return out;
  }

  /**
   * Add a region to the RegionManager
   * @param {String} name   The name of the regions
   * @param {String|Object|Region|HTMLElement} def The region to associate with the name and the RegionManager
   */
  addRegion (name, def) {

    let region = Region.buildRegion(def);
    this._setRegion(name, region);

    return region;

  }

  /**
   * Remove one or more regions from the manager
   * @param {...name} name A array of region names
   */
  removeRegion (names:string[]|string) {
    //let names = utils.slice(arguments)
    if (typeof names === 'string') { names = [<string>names]}
    (<Array<string>>names).forEach(function (name) {
      if (utils.has(this.regions, name)) {
        let region = this.regions[name];
        region.destroy();
        this._unsetRegion(name);

      }
    }, this);

  }
  /**
   * Destroy the regionmanager
   */
  destroy () {
    this.removeRegions();
    super.destroy();

  }

  /**
   * Remove all regions from the manager
   */
  removeRegions () {
    utils.callFunc(this.removeRegion, this, Object.keys(this._regions))
  }

  /**
   * @private
   */
  _setRegion (name, region) {
    if (this._regions[name]) {
      this._regions[name].destroy()
    } 
    this._regions[name] = region;
  }

  /**
   * @private
   */
  _unsetRegion (name) {
    delete this._regions[name];
  }
}
