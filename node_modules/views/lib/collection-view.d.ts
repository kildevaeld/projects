import { DataView, DataViewOptions } from './data-view';
import { IModel } from 'collection';
import { IView } from './baseview';
import { IDataView } from './types';
export interface CollectionViewOptions extends DataViewOptions {
    childView?: IDataView;
    emptyView?: IView;
    childViewContainer?: string;
    childViewOptions?: DataViewOptions;
    sort?: boolean;
}
export declare class CollectionView<T extends HTMLElement> extends DataView<T> {
    childView: IDataView;
    emptyView: IView;
    private _emptyView;
    private _container;
    private _buffer;
    /** Child views associated with the view
     * @property {Array<IDataView>} children
     */
    children: IDataView[];
    /** Whether the collection sould be sorted
     * @property {boolean} sort
     */
    sort: boolean;
    /** CollectionView
   * @extends DataView
   * @param {DataViewOptions} options
   */
    constructor(options?: CollectionViewOptions);
    /**
   * Render the collection view and alle of the children
   * @return {CollectionView}
   *
   */
    render(options?: any): any;
    /**
     * @protected
     */
    setCollection(collection: any): void;
    renderCollection(): void;
    /**
   * Returns a new instance of this.childView with attached model.
   *
   * @param {IModel} model
   * @protected
   */
    getChildView(model: IModel): IDataView;
    renderChildView(view: any, index: any): void;
    showEmptyView(): void;
    hideEmptyView(): void;
    destroyChildren(): void;
    removeChildView(view: IDataView): void;
    /**
   * Destroy the collection view and all of it's children
   * @see JaffaMVC.View
   * @return {JaffaMVC.View}
   */
    destroy(): any;
    private _renderCollection();
    /**
   * Append childview to the container
   * @private
   * @param {IDataView} view
   * @param {Number} index
   */
    private _appendChild(view, index);
    /**
   * Attach the childview's element to the CollectionView.
   * When in buffer mode, the view is added to a documentfragment to optimize performance
   * @param {View} view  A view
   * @param {Number} index The index in which to insert the view
   * @private
   */
    private _attachHTML(view, index);
    /**
   * Proxy event froms childview to the collectionview
   * @param {IView} view
   * @private
   */
    private _proxyChildViewEvents(view);
    private _updateIndexes(view, increment, index?);
    private _startBuffering();
    private _stopBuffering();
    private _initContainer();
    private _destroyContainer();
    /**
     * Internal method. Check whether we need to insert the view into
   * the correct position.
     * @param  {IView} childView [description]
     * @param  {number} index     [description]
     * @return {boolean}           [description]
     */
    _insertBefore(childView: IDataView, index: number): boolean;
    /**
     * Internal method. Append a view to the end of the $el
     * @private
     */
    _insertAfter(childView: IDataView): void;
    /**
     * Delegate collection events
     * @private
     */
    private _delegateCollectionEvents();
    /**
     * Called when a model is add to the collection
     * @param {JaffaMVC.Model|Backbone.model} model Model
     * @private
     */
    private _onCollectionAdd(model);
    /**
     * Called when a model is removed from the collection
     * @param {JaffaMVC.Model|Backbone.model} model Model
     * @private
     */
    private _onCollectionRemove(model);
    /**
     * Called when the collection is sorted
     * @private
     */
    private _onCollectionSort();
}
