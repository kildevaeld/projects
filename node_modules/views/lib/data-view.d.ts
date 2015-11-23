import { TemplateView, TemplateViewOptions } from './templateview';
import { IModel, ICollection } from 'collection';
import { IDataView } from 'types';
export interface DataViewOptions extends TemplateViewOptions {
    model?: IModel;
    collection?: ICollection;
}
export declare class DataView<T extends HTMLElement> extends TemplateView<T> implements IDataView {
    private _model;
    private _collection;
    private _dataEvents;
    model: IModel;
    collection: ICollection;
    /**
     * DataView
     * @param {DataViewOptions} options
     * @extends TemplateView
     */
    constructor(options?: DataViewOptions);
    setModel(model: IModel): void;
    setCollection(collection: ICollection): void;
    getTemplateData(): any;
    delegateEvents(events?: any): any;
    undelegateEvents(): DataView<T>;
    private _delegateDataEvents(model, collection);
    private _undelegateDataEvents();
    private _filterEvents(obj);
}
