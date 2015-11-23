import { BaseObject } from './object';
import { Region } from './region';
export declare type RegionMap = {
    [key: string]: Region;
};
export declare class RegionManager extends BaseObject {
    private _regions;
    /**
     * Regions
     * @type {string:Region}
     */
    regions: {
        [key: string]: Region;
    };
    /** Region manager
     * @extends BaseObject
     */
    constructor();
    /**
      * Add one or more regions to the region manager
      * @param {Object} regions
      */
    addRegions(regions: RegionMap): {};
    /**
     * Add a region to the RegionManager
     * @param {String} name   The name of the regions
     * @param {String|Object|Region|HTMLElement} def The region to associate with the name and the RegionManager
     */
    addRegion(name: any, def: any): Region;
    /**
     * Remove one or more regions from the manager
     * @param {...name} name A array of region names
     */
    removeRegion(names: string[] | string): void;
    /**
     * Destroy the regionmanager
     */
    destroy(): void;
    /**
     * Remove all regions from the manager
     */
    removeRegions(): void;
    /**
     * @private
     */
    _setRegion(name: any, region: any): void;
    /**
     * @private
     */
    _unsetRegion(name: any): void;
}
