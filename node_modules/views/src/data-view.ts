import {TemplateView, TemplateViewOptions} from './templateview'
import {IModel, ICollection, } from 'collection'
import {IDataView} from 'types'
import {normalizeUIKeys} from './view'
import {extend, bind} from 'utilities'


export interface DataViewOptions extends TemplateViewOptions {
  model?: IModel
  collection?:ICollection
}

export class DataView<T extends HTMLElement> extends TemplateView<T> implements IDataView {

	private _model: IModel
  private _collection: ICollection
	private _dataEvents: any

  public get model (): IModel { return this._model }

	public set model (model) {
		this.setModel(model)
	}

  public get collection () { return this._collection }

  public set collection (collection) {
    this.setCollection(collection)
  }


  /**
   * DataView
   * @param {DataViewOptions} options
   * @extends TemplateView
   */
  constructor (options:DataViewOptions = {}) {

    
    if (options.model) {
      this.model = options.model
    }
    if (options.collection) {
      this.collection = options.collection
    }

    super(options)

  }

	public setModel (model:IModel) {
		if (this._model === model) return

    this.triggerMethod('before:model', this._model, model)

    if (this._model) {
			this.stopListening(this._model)
		}

		this._model = model

    this.triggerMethod('model', model)
  }

  public setCollection (collection:ICollection) {
    if (this._collection === collection) return

    this.triggerMethod('before:collection', this._collection, collection)

    if (this._collection) {
			this.stopListening(this._collection)
		}

		this._collection = collection

    this.triggerMethod('collection', collection)
  }

  public getTemplateData (): any {
    return this.model ?
      typeof this.model.toJSON === 'function' ?
      this.model.toJSON() : this.model  : {}
  }

	public delegateEvents (events?:any): any {
		events = events||this.events
		//events = normalizeUIKeys(events)

		let {c,e,m} = this._filterEvents(events)

		super.delegateEvents(e)
		this._delegateDataEvents(m,c)

		return this
	}

	public undelegateEvents() {
		this._undelegateDataEvents()
		super.undelegateEvents()
		return this
	}

	private _delegateDataEvents (model:any, collection:any) {

		this._dataEvents = {};
    let fn = (item, ev) => {

      if (!this[item]) return {};
      let out = {}, k, f;

      for (k in ev) {
        f = bind(ev[k], this);
        this[item].on(k,f);
        out[item+":"+k] = f;
      }

      return out;
    };

    extend(this._dataEvents,
      fn('model',model),
      fn('collection',collection));

	}

	private _undelegateDataEvents () {
		if (!this._dataEvents) return;
    let k, v;
    for (k in this._dataEvents) {
      v = this._dataEvents[k];
      let [item, ev] = k.split(':');
      if (!this[item]) continue;

      this[item].off(ev, v);
      //this.stopListening(this[item],ev, v);
    }
    delete this._dataEvents;
	}

	private _filterEvents (obj:any) {
    /*jshint -W030 */
    let c = {}, m = {}, e = {}, k, v;
    for (k in obj) {
      let [ev,t] = k.split(' ');
      ev = ev.trim(), t = t ? t.trim() : "", v = obj[k];
      if (t === 'collection') {
        c[ev] = v;
      } else if (t === 'model') {
        m[ev] = v;
      } else {
        e[k] = v;
      }
    }
    return {c,m,e};
  }
}
