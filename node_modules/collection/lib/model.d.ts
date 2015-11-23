import { BaseObject } from './object';
import { IModel, ICollection } from './interfaces';
export interface ModelOptions {
    collection?: ICollection;
}
export interface ModelSetOptions {
    unset?: boolean;
    silent?: boolean;
}
export declare class Model extends BaseObject implements IModel {
    protected _attributes: any;
    uid: string;
    collection: ICollection;
    idAttribute: string;
    private _previousAttributes;
    private _changed;
    private _changing;
    private _pending;
    id: any;
    constructor(attributes?: Object, options?: ModelOptions);
    set(key: string | Object, val?: any, options?: ModelSetOptions): Model;
    get(key: any): any;
    unset(key: any, options: ModelSetOptions): void;
    has(attr: any): boolean;
    hasChanged(attr?: any): boolean;
    clear(options?: any): Model;
    changed: any;
    changedAttributes(diff: any): any;
    previous(attr: any): any;
    previousAttributes(): any;
    toJSON(): any;
    clone(): IModel;
}
