
import * as base from './baseview'
import {logger} from './debug'
import * as utils from 'utilities';
const kUIRegExp = /@ui.([a-zA-Z_\-\$#]+)/i
const debug = logger('view');


export function normalizeUIKeys (obj:any, uimap:{[key:string]:string}): any {
  /*jshint -W030 */
    let o = {}, k, v, ms, sel, ui;

    for (k in obj) {
      v = obj[k];
      if ((ms = kUIRegExp.exec(k)) !== null) {
        ui = ms[1], sel = uimap[ui];
        if (sel != null) {
          k = k.replace(ms[0], sel);
        }
      }
      o[k] = v;
    }

    return o;
}

export type UIMap = { [key:string]: HTMLElement }

export interface ViewOptions extends base.BaseViewOptions {
  ui?: {[key:string]: string}|Function
}

export class View<T extends HTMLElement> extends base.BaseView<T> {

  ui: UIMap
  triggers: {[key: string]: string}

  private _ui: {[key:string]: string}
  private _options: ViewOptions

  /**
   * View
   * @param {ViewOptions} options
   * @extends BaseView
   */
  constructor (options?: ViewOptions) {
    this._options = options
    super(options)
  }


  delegateEvents (events?:any) {
    
    this._bindUIElements()

    events = events || this.events;
    events = normalizeUIKeys(events, this._ui)

    let triggers = this._configureTriggers()

    events = utils.extend({}, events, triggers)
    debug('%s delegate events %j', this.cid, events);
    super.delegateEvents(events)

    return this

  }

  undelegateEvents (): any {
    this._unbindUIElements()
    debug('%s undelegate events', this.cid);
    super.undelegateEvents()
    return this
  }

  /**
   * Bind ui elements
   * @private
   */
  _bindUIElements() {

    let ui = this.getOption('ui') //this.options.ui||this.ui
    if (!ui) return;

    if (!this._ui) {
      this._ui = ui;
    }

    ui = utils.result(this, '_ui');

    this.ui = {};
    
    Object.keys(ui).forEach( (k) => {
      let elm: any = this.$(ui[k]);
      if (elm && elm.length) {
        // unwrap if it's a nodelist.
        if (elm instanceof NodeList) {
          elm = elm[0]
        }
        debug('added ui element %s %s',k,ui[k]);
        this.ui[k] = elm;
      } else {
        console.warn('view ',this.cid,': ui element not found ',k,ui[k]);
      }
    });

  }

  /**
   * Unbind ui elements
   * @private
   */
  _unbindUIElements () {
    
  }

  /**
   * Configure triggers
   * @return {Object} events object
   * @private
   */
  _configureTriggers() {

    let triggers = this.getOption('triggers')||{}

    if (typeof triggers === 'function') {
      triggers = triggers.call(this)
    }

    // Allow `triggers` to be configured as a function
    triggers = normalizeUIKeys(triggers, this._ui);

    // Configure the triggers, prevent default
    // action and stop propagation of DOM events
    let events = {}, val, key;
    for (key in triggers) {
      val = triggers[key];
      debug('added trigger %s %s',key, val)
      events[key] = this._buildViewTrigger(val);
    }

    return events;

  }

  /**
   * builder trigger function
   * @param  {Object|String} triggerDef Trigger definition
   * @return {Function}
   * @private
   */
  _buildViewTrigger(triggerDef) {

    if (typeof triggerDef === 'string')
      triggerDef = { event: triggerDef }

    let options = utils.extend({
      preventDefault: true,
      stopPropagation: true
    }, triggerDef);

    return function(e) {

      if (e) {
        if (e.preventDefault && options.preventDefault) {
          e.preventDefault();
        }
        if (e.stopPropagation && options.stopPropagation) {
          e.stopPropagation();
        }
      }

      this.triggerMethod(options.event, {
        view: this,
        model: this.model,
        collection: this.collection
      });

    };
  }
}
