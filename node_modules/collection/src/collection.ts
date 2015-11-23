/// <reference path="interfaces" />
import {BaseObject} from './object'
import {IModel,ICollection, Silenceable} from './interfaces'
import {Model} from './model'
import {extend} from 'utilities/lib/objects'
import {sortBy, find, slice} from 'utilities/lib/arrays'
import {callFunc} from 'utilities/lib/utils'

var setOptions = {add: true, remove: true, merge: true};
var addOptions = {add: true, remove: false};

export type SortFunction = <T>(a:T, b:T) => number


export interface CollectionOptions<U> {
  model?: new (attr:Object, options?:any) => U
}


export interface CollectionSetOptions extends Silenceable {
  at?:number
  sort?:boolean
  add?:boolean
  merge?:boolean
  remove?:boolean
  parse?:boolean
}

export interface CollectionRemoveOptions extends Silenceable {
  index?: number
}

export interface CollectionSortOptions extends Silenceable { }

export interface CollectionCreateOptions {
  add?: boolean
}

export interface CollectionResetOptions extends Silenceable {
  previousModels?: IModel[]
}

export class Collection<U extends IModel> extends BaseObject implements ICollection {
  /**
   * The length of the collection
   * @property {Number} length
   */
  public get length () {
		return this.models.length
	}

  private _model: new (attr:Object, options?:any) => U
	public get Model (): new (attr:Object, options?:any) => U {
   if (!this._model) {
     this._model = <any>Model
   }

   return this._model
  }

  public set Model (con:new (attr:Object, options?:any) => U) {
   this._model = con
  }

  private _models:U[]

  get models (): U[] {
    return this._models||(this._models=[]);
  }

  comparator:string|SortFunction

  options: CollectionOptions<U>

  constructor (models?:U[]|Object[], options:CollectionOptions<U>={}) {

    this.options = options;

    if (this.options.model) {
      this.Model = this.options.model
    }

    //this._byId = {};
    if (models) {
      this.add(models);
    }
		super();
  }

  add (models:U|U[]|Object|Object[], options:CollectionSetOptions={}) {
    if (!Array.isArray(models)) {
      if (!(models instanceof this.Model)) {
        models = this.create(models, { add: false })
      }
    } else {
      models = (<any[]>models).map<U>( (item) => {
        return (item instanceof this.Model) ? item : this.create(item, { add: false })
      });
    }
    this.set(<U|U[]>models, extend({merge:false}, options, addOptions));
  }

  protected set (items:U|U[], options: CollectionSetOptions={}) {
    options = extend({}, setOptions, options);
    if (options.parse) items = this.parse(items, options);

		var singular = !Array.isArray(items);
    let models: U[] = <U[]>(singular ? (items ? [items] : []) : (<U[]>items).slice())

		var i, l, id, model: U, attrs, existing: U, sort;
    var at = options.at;
    //var targetModel = this.model;
    var sortable = this.comparator && (at == null) && options.sort !== false;
    var sortAttr = typeof this.comparator === 'string' ? this.comparator : null;
    var toAdd = [], toRemove = [], modelMap = {};
    var add = options.add, merge = options.merge, remove = options.remove;
    var order = !sortable && add && remove ? [] : null;

    // Turn bare objects into model references, and prevent invalid models
    // from being added.
    for (i = 0, l = (<U[]>models).length; i < l; i++) {
      model = models[i]

			id = model.get(model.idAttribute)||model.uid

      // If a duplicate is found, prevent it from being added and
      // optionally merge it into the existing model.
      if (existing = this.get(id)) {
        if (remove) modelMap[existing.uid] = true;
        if (merge) {
          attrs = model.toJSON()
          //if (options.parse) attrs = existing.parse(attrs, options);
          existing.set(attrs, options);
          if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
        }
        models[i] = existing;

      // If this is a new, valid model, push it to the `toAdd` list.
      } else if (add) {
        models[i] = model//this._prepareModel(attrs, options);
        if (!model) continue;
        toAdd.push(model);
        this._addReference(model, options);
      }

      // Do not add multiple models with the same `id`.
       model = existing || model;
      if (order && !modelMap[model.id]) order.push(model);
      modelMap[model.uid] = true;
    }

    // Remove nonexistent models if appropriate.
    if (remove) {
      for (i = 0, l = this.length; i < l; ++i) {
        if (!modelMap[(model = this.models[i]).uid]) toRemove.push(model);
      }
      if (toRemove.length) this.remove(toRemove, options);
    }

    // See if sorting is needed, update `length` and splice in new models.
    if (toAdd.length || (order && order.length)) {
      if (sortable) sort = true;
      //this.length += toAdd.length;
      if (at != null) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          this.models.splice(at + i, 0, toAdd[i]);
        }
      } else {
        if (order) this.models.length = 0;
        var orderedModels = order || toAdd;
        for (i = 0, l = orderedModels.length; i < l; i++) {
          this.models.push(orderedModels[i]);
        }
      }
    }

    // Silently sort the collection if appropriate.
    if (sort) this.sort({silent: true});

    // Unless silenced, it's time to fire all appropriate add/sort events.
    if (!options.silent) {
      for (i = 0, l = toAdd.length; i < l; i++) {

        (model = toAdd[i]).trigger('add', model, this, options);
      }
      if (sort || (order && order.length)) this.trigger('sort', this, options);
      if (toAdd.length || toRemove.length) this.trigger('update', this, options);
    }

    // Return the added (or merged) model (or models).
    return singular ? models[0] : models;
  }

  remove (models:U[]|U, options: CollectionRemoveOptions={}) {
    var singular = !Array.isArray(models);
    models = <U[]>(singular ? [models] : (<U[]>models).slice());

    var i, l, index, model;
    for (i = 0, l = (<U[]>models).length; i < l; i++) {
      model = models[i] = this.get(models[i]);
      if (!model) continue;

      index = this.indexOf(model);
      this.models.splice(index, 1);

      if (!options.silent) {
        options.index = index;
        model.trigger('remove', model, this, options);
      }
      this._removeReference(model, options);
    }
    return singular ? models[0] : models;
  }

  get (id:any): U {
    return this.find(id)
  }

  // Get the model at the given index.
  at (index) {
    return this.models[index];
  }

  clone (options?:CollectionOptions<U>) {
    options = options||this.options
    return new (<any>this).constructor(this.models, options);
  }

  sort (options: CollectionSortOptions={}) {
    if (!this.comparator) throw new Error('Cannot sort a set without a comparator');


    // Run sort based on type of `comparator`.
    if (typeof this.comparator === 'string' || this.comparator.length === 1) {
      this._models = this.sortBy((<any>this.comparator), this);
    } else {
      this.models.sort((<SortFunction>this.comparator).bind(this));
    }

    if (!options.silent) this.trigger('sort', this, options);
    return this;
  }

  sortBy (key: string|Function, context?: any): U[] {
    return sortBy(this._models,key, context)
  }

  push (model, options={}) {
    return this.add(model, extend({at:this.length}, options));
  }

  reset (models, options:CollectionResetOptions={}) {
    this.forEach((model) => {
      this._removeReference(model, options);
    });

    options.previousModels = this.models;
    this._reset();

    models = this.add(models, options);
    if (!options.silent) this.trigger('reset', this, options);

    return models;
  }

  create (values?:any, options: CollectionCreateOptions={add:true}): IModel  {
    let model = new this.Model(values, options)
    if (options.add)
      this.add(model)
    return model
  }

  parse (models:U|U[], options: CollectionSetOptions={}): U|U[] {
    return models
  }

  find (nidOrFn) {
    let model;
    if (typeof nidOrFn === 'function') {
      model = find<IModel>(this.models, nidOrFn);
    } else {
      model = find<IModel>(this.models, function (model) {
        return model.id == nidOrFn || model.uid == nidOrFn || nidOrFn === model;
      });
    }

    return model;
  }

  forEach (iterator:(model:U, index?:number) => void, ctx?:any) {
    for (let i=0, l = this.models.length; i < l; i++) {
      iterator.call(ctx||this, this.models[i], i);
    }

    return this;
  }

  indexOf (model:U): number {
    return this.models.indexOf(model)
  }

  toJSON () {
    return this.models.map(function (m) { return m.toJSON(); });
  }



  private _removeReference (model:U, options?: any) {
    if (this === model.collection) delete model.collection;
    this.stopListening(model)
  }

  private _addReference (model:IModel, options?:any) {
    if (!model.collection) model.collection = this;

    this.listenTo(model, 'all', this._onModelEvent)
  }

  private _reset () {
    this._models = [];
  }

  private _onModelEvent (event, model, collection, options) {
    if ((event === 'add' || event === 'remove') && collection !== this) return;
    if (event === 'destroy') this.remove(model, options);

    callFunc(this.trigger, this, slice(arguments))
  }

  destroy () {

    this.models.forEach( m => {
      if (typeof (<any>m).destroy === 'function' &&
         m.collection == this) (<any>m).destroy();
    });

    super.destroy();

  }

}
