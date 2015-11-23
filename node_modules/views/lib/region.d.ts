import { BaseObject } from './object';
import { IView } from './baseview';
export interface RegionOptions {
    el: HTMLElement;
}
/** Region  */
export declare class Region extends BaseObject {
    private _el;
    private _view;
    options: RegionOptions;
    view: IView;
    el: HTMLElement;
    /**
     * Build region from a definition
     * @param {Object|String|Region} def The description of the region
     * @return {Region}
     */
    static buildRegion(def: any, context?: HTMLElement): Region;
    /**
     * Regions manage a view
     * @param {Object} options
     * @param {HTMLElement} options.el  A Html element
     * @constructor Region
     * @extends BaseObject
     * @inheritdoc
     */
    constructor(options: RegionOptions);
    /**
   * Show a view in the region.
   * This will destroy or remove any existing views.
   * @param  {View} view    The view to Show
   * @return {Region}       this for chaining.
   */
    show(view: IView, options?: any): Region;
    /**
     * Destroy the region, this will remove any views, but not the containing element
     * @return {Region} this for chaining
     */
    destroy(): void;
    /**
     * Empty the region. This will destroy any existing view.
     * @return {Region} this for chaining;
     */
    empty(): Region;
    /**
     * Attach the view element to the regions element
     * @param {View} view
     * @private
     *
     */
    private _attachHtml(view);
    _destroyView(): void;
}
