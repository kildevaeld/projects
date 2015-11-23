/*global View, RegionManager, Region*/
import {TemplateView} from './templateview'
import {RegionManager, RegionMap} from './region-manager'
import {proxy} from 'utilities';
import {Region} from './region'

export class LayoutView<T extends HTMLElement> extends TemplateView<T> {
	private _regions: any
	private _regionManager: RegionManager

	public get regions(): RegionMap {
		return this._regionManager.regions
	}

	/**
	 * LayoutView
	 * @param {Object} options options
	 * @constructor LayoutView
	 * @extends TemplateView
	 */
	constructor(options) {

		// Set region manager
		this._regionManager = new RegionManager();
		proxy(this, this._regionManager, ['removeRegion', 'removeRegions']);

		this._regions = this.getOption('regions', options||{});

		super(options);

	}
	
	render (options?:any): any {
		this.triggerMethod('before:render')
		super.render({silent:true})
		this.addRegion(this._regions||{});
		this.triggerMethod('render')
		return this
	}
	/**
	 * Add one or more regions to the view
	 * @param {string|RegionMap} name
	 * @param {Object|string|HTMLElement} def
	 */
  addRegion(name: string|RegionMap, def?: Object|string|HTMLElement) {
		let regions = {}
		if (typeof name === 'string') {
			if (def == null) throw new Error('add region')
			regions[name] = def
		} else { regions = name }

		for (let k in regions) {
			let region = Region.buildRegion(regions[k], this.el)
			this._regionManager.addRegion(k, region)
		}

	}

	/**
	 * Delete one or more regions from the the layoutview
	 * @param {string|Array<string>} name
	 */
	removeRegion(name:string[]|string) {
		this._regionManager.removeRegion(name)
	}

  destroy() {
		super.destroy();
		this._regionManager.destroy();
	}



}
