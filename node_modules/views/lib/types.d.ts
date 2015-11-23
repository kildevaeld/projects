import { IView } from './baseview';
import { IModel, ICollection } from 'collection';
export interface IDataView extends IView {
    model: IModel;
    collection: ICollection;
}
export interface Silenceable {
    silent?: boolean;
}
