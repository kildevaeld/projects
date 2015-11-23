
import {BaseObject} from './object'
import {IModel, ICollection} from './interfaces'
import {uniqueId, equal} from 'utilities/lib/utils'
import {has, extend} from 'utilities/lib/objects'





export interface ModelOptions {
    collection?: ICollection
  }

  export interface ModelSetOptions {
    unset?: boolean
    silent?: boolean
  }

  export class Model extends BaseObject implements IModel {
    protected _attributes: any
    public uid: string
    public collection: ICollection
    public idAttribute: string

    private _previousAttributes: any
    private _changed: any
    private _changing: boolean
    private _pending: boolean

    get id() {
      if (this.idAttribute in this._attributes) return this._attributes[this.idAttribute]
    }


    constructor(attributes: Object = {}, options?: ModelOptions) {
      options = options || {}
      this._attributes = attributes
      this.uid = uniqueId('uid')

      this._changed = {};

      this.collection = options.collection;

      super();

    }

    set(key: string|Object, val?: any, options: ModelSetOptions = {}) {
      var attr, attrs: any = {}, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        attrs[<string>key] = val;
      }

      options || (options = {});

      // Run validation.
      //if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset = options.unset;
      silent = options.silent;
      changes = [];
      changing = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = extend(Object.create(null), this._attributes);
        this._changed = {};
      }
      current = this._attributes, prev = this._previousAttributes;


      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!equal(current[attr], val)) changes.push(attr);
        if (!equal(prev[attr], val)) {
          this._changed[attr] = val;
        } else {
          delete this._changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = !!options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;

      return this;
    }

    get(key) {
      return this._attributes[key];
    }

    unset(key, options: ModelSetOptions) {
      this.set(key, void 0, extend({}, options, { unset: true }));
    }

    has(attr) {
      return this.get(attr) != null;
    }

    hasChanged(attr?) {
      if (attr == null) return !!Object.keys(this.changed).length;
      return has(this.changed, attr);
    }

    clear(options?: any) {
      let attrs = {};
      for (let key in this._attributes) attrs[key] = void 0;
      return this.set(attrs, extend({}, options, { unset: true }));
    }

    get changed() {
      return extend({}, this._changed);
    }

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes(diff) {
      if (!diff) return this.hasChanged() ? extend(Object.create(null), this.changed) : false;
      var val, changed = {};
      var old = this._changing ? this._previousAttributes : this._attributes;
      for (var attr in diff) {
        if (equal(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    }

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    }

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes() {
      return extend(Object.create(null), this._previousAttributes);
    }

    toJSON() {
      return JSON.parse(JSON.stringify(this._attributes));
    }

    clone(): IModel {
      return new ((<any>this).constructor)(this._attributes);
    }

 }
