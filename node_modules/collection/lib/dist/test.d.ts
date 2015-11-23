declare module collection {
    interface IModel extends events.IEventEmitter {
        collection?: ICollection;
        idAttribute?: string;
        uid: string;
        id?: string;
        get(key: string): any;
        set(key: string | Object, value?: any): any;
        toJSON?: () => any;
        hasChanged(attr?: any): boolean;
    }
    interface ICollection extends events.IEventEmitter {
        length: number;
        indexOf: (item: IModel) => number;
        forEach(fn: (item: IModel, index?: number) => any): any;
        push(item: IModel): any;
    }
    interface Silenceable {
        silent?: boolean;
    }
}
declare module collection {
    interface ModelOptions {
        collection?: ICollection;
    }
    interface ModelSetOptions {
        unset?: boolean;
        silent?: boolean;
    }
    class Model extends events.EventEmitter implements IModel {
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
        hasChanged(attr?: any): any;
        clear(options?: any): Model;
        changed: any;
        changedAttributes(diff: any): any;
        previous(attr: any): any;
        previousAttributes(): any;
        toJSON(): any;
        clone(): IModel;
    }
}
declare module collection {
    type SortFunction = <T>(a: T, b: T) => number;
    interface CollectionOptions<U> {
        model?: new (attr: Object, options?: any) => U;
    }
    interface CollectionSetOptions extends Silenceable {
        at?: number;
        sort?: boolean;
        add?: boolean;
        merge?: boolean;
        remove?: boolean;
        parse?: boolean;
    }
    interface CollectionRemoveOptions extends Silenceable {
        index?: number;
    }
    interface CollectionSortOptions extends Silenceable {
    }
    interface CollectionCreateOptions {
        add?: boolean;
    }
    interface CollectionResetOptions extends Silenceable {
        previousModels?: IModel[];
    }
    class Collection<U extends IModel> extends events.EventEmitter implements ICollection {
        /**
         * The length of the collection
         * @property {Number} length
         */
        length: number;
        private _model;
        Model: new (attr: Object, options?: any) => U;
        private _models;
        models: U[];
        comparator: string | SortFunction;
        options: CollectionOptions<U>;
        constructor(models?: U[] | Object[], options?: CollectionOptions<U>);
        add(models: U | U[] | Object | Object[], options?: CollectionSetOptions): void;
        protected set(items: U | U[], options?: CollectionSetOptions): U | U[];
        remove(models: U[] | U, options?: CollectionRemoveOptions): any;
        get(id: any): U;
        at(index: any): U;
        clone(options?: CollectionOptions<U>): any;
        sort(options?: CollectionSortOptions): Collection<U>;
        sortBy(key: string | Function, context?: any): U[];
        push(model: any, options?: {}): void;
        reset(models: any, options?: CollectionResetOptions): any;
        create(values?: any, options?: CollectionCreateOptions): IModel;
        parse(models: U | U[], options?: CollectionSetOptions): U | U[];
        find(nidOrFn: any): any;
        forEach(iterator: (model: U, index?: number) => void, ctx?: any): Collection<U>;
        indexOf(model: U): number;
        toJSON(): any[];
        private _removeReference(model, options?);
        private _addReference(model, options?);
        private _reset();
        private _onModelEvent(event, model, collection, options);
        destroy(): void;
    }
}
