import { TemplateView } from './templateview';
import { RegionMap } from './region-manager';
export declare class LayoutView<T extends HTMLElement> extends TemplateView<T> {
    private _regions;
    private _regionManager;
    regions: RegionMap;
    /**
     * LayoutView
     * @param {Object} options options
     * @constructor LayoutView
     * @extends TemplateView
     */
    constructor(options: any);
    render(options?: any): any;
    /**
     * Add one or more regions to the view
     * @param {string|RegionMap} name
     * @param {Object|string|HTMLElement} def
     */
    addRegion(name: string | RegionMap, def?: Object | string | HTMLElement): void;
    /**
     * Delete one or more regions from the the layoutview
     * @param {string|Array<string>} name
     */
    removeRegion(name: string[] | string): void;
    destroy(): void;
}
