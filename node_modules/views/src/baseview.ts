/// <reference path="typings" />

import {BaseObject} from './object';
import * as utils from 'utilities';
import {EventEmitter, IEventEmitter} from 'eventsjs';
import {logger} from './debug';

const debug = logger('baseview');
const paddedLt = /^\s*</;
const unbubblebles = 'focus blur change'.split(' ');

export type EventsMap = {[key:string]: Function|string}
export type StringMap = {[key: string]: string}

export interface Destroyable {
  destroy(): any
  isDestroyed: boolean
}

export interface IView extends IEventEmitter, Destroyable {
  el: HTMLElement
  render(options?:any)
  remove()
}

export interface BaseViewOptions {
  el?: HTMLElement
  id?: string
  attributes?: StringMap
  className?:string
  tagName?:string
  events?: EventsMap
}

let viewOptions = ['el', 'id', 'attributes', 'className', 'tagName', 'events'];

export class BaseView<T extends HTMLElement> extends BaseObject implements IView {

  static find(selector: string, context: HTMLElement): NodeList {
    return context.querySelectorAll(selector)
  }

  tagName: string
  className: string
  id: string

  private _cid: string
  get cid(): string  {
    return this._cid
  }


  el: T
  events: EventsMap 
  attributes: StringMap
  
  private _domEvents: any[]

  /**
   * BaseView
   * @param {BaseViewOptions} options
   * @extends BaseObject
   */
  constructor (options: BaseViewOptions = {}) {

    this._cid = utils.uniqueId('view')

    utils.extend(this, utils.pick(options, viewOptions))

    this._domEvents = []

    if (this.el == null) {
      this._ensureElement()
    } else {
      this.delegateEvents();
    }

    super(options)

  }

  /**
   * Delegate events
   * @param {EventsMap} events
   */
  delegateEvents (events?: EventsMap): any {

    if (!(events || (events = utils.result(this, 'events')))) return this;
    this.undelegateEvents();

    let dels = []
    for (let key in events) {
      let method = events[key];
      if (typeof method !== 'function') method = this[<string>method];

      let match = key.match(/^(\S+)\s*(.*)$/);

      // Set delegates immediately and defer event on this.el
      let boundFn = utils.bind(<Function>method, this);
      if (match[2]) {
        this.delegate(match[1], match[2], boundFn);
      } else {
        dels.push([match[1], boundFn]);
      }
    }

    dels.forEach( d => { this.delegate(d[0],d[1]) });

    return this;
  }

  /**
   * Undelegate events
   */
  undelegateEvents () {
    if (this.el) {
      for (var i = 0, len = this._domEvents.length; i < len; i++) {
        var item = this._domEvents[i];
        utils.removeEventListener(this.el, item.eventName, item.handler);
      }
      this._domEvents.length = 0;
    }
    return this;
  }

  delegate (eventName:string, selector?:string|Function, listener?: Function) {
    if (typeof selector === 'function') {
      listener = <Function>selector;
      selector = null;
    }

    let root = this.el;
    let handler = selector ? function (e) {
      let node = e.target || e.srcElement;

      // Already handled
      if (e.delegateTarget) return;

      for (; node && node != root; node = node.parentNode) {
        if (utils.matches(node, selector)) {

          e.delegateTarget = node;
          listener(e);
        }
      }
    } : function (e) {
      if (e.delegateTarget) return;
      listener(e);
    };
    /*jshint bitwise: false*/
    let useCap = !!~unbubblebles.indexOf(eventName) && selector != null;
    debug('%s delegate event %s ',this.cid, eventName);
    utils.addEventListener(this.el, eventName, handler, useCap);
    this._domEvents.push({eventName: eventName, handler: handler, listener: listener, selector: selector});
    return handler;
  }

  undelegate (eventName:string, selector?:string|Function, listener?:Function) {
    if (typeof selector === 'function') {
      listener = <Function>selector;
      selector = null;
    }

    if (this.el) {
      var handlers = this._domEvents.slice();
      for (var i = 0, len = handlers.length; i < len; i++) {
        var item = handlers[i];

        var match = item.eventName === eventName &&
            (listener ? item.listener === listener : true) &&
            (selector ? item.selector === selector : true);

        if (!match) continue;

        utils.removeEventListener(this.el, item.eventName, item.handler);
        this._domEvents.splice(utils.indexOf(handlers, item), 1);
      }
    }
    return this;
  }

  render (options:any): any {
    return this
  }

  /**
   * Append the view to a HTMLElement
   * @param {HTMLElement|string} elm A html element or a selector string
   * @return {this} for chaining
   */
  public appendTo(elm:HTMLElement|string): any {
    
    if (elm instanceof HTMLElement) {
      elm.appendChild(this.el)  
    } else {
      let el = document.querySelector(<string>elm)
      el ? el.appendChild(this.el) : void 0
    }
    
    
    return this
  }

  /**
   * Append a element the view
   * @param {HTMLElement} elm
   * @param {String} toSelector
   * @return {this} for chaining 
   */
  append (elm: HTMLElement, toSelector?:string): any {
    if (toSelector != null) {
      let ret = this.$(toSelector)
      if (ret instanceof NodeList && ret.length > 0) {
        ret[0].appendChild(elm)
      } else if (ret instanceof HTMLElement) {
        ret.appendChild(elm)
      }
    } else {
      this.el.appendChild(elm)
    }
    return this
  }

  /**
   * Convience for view.el.querySelectorAll()
   * @param {string|HTMLElement} selector
   */
  $ (selector: string|HTMLElement): NodeList|HTMLElement {
    if (selector instanceof HTMLElement) {
      return selector
    } else {
        return BaseView.find(<string>selector, this.el)
    }
  }

  setElement (elm: T) {
    this.undelegateEvents()
    this._setElement(elm)
    this.delegateEvents()
  }

  remove () {
    this._removeElement();
    return this;
  }

  private _createElement (tagName: string): T {
    return <T>document.createElement(tagName)
  }

  private _ensureElement () {
    if (!this.el) {
        var attrs = utils.extend({}, utils.result(this, 'attributes'));
        if (this.id) attrs.id = utils.result(this, 'id');
        if (this.className) attrs['class'] = utils.result(this, 'className');
        debug('%s created element: %s', this.cid, utils.result(this, 'tagName')||'div');
        this.setElement(this._createElement(utils.result(this, 'tagName')||'div'));
        this._setAttributes(attrs);
      } else {
        this.setElement(utils.result(this, 'el'));
      }
  }

  private _removeElement () {
    this.undelegateEvents();
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }

  private _setElement (element: T|string) {
    if (typeof element === 'string') {
      if (paddedLt.test(element)) {
        let el = document.createElement('div');
        el.innerHTML = element;
        this.el = <T>el.firstElementChild
      } else {
        this.el = <T>document.querySelector(element);
      }
    } else {
      this.el = element;
    }
  }

  private _setAttributes (attrs) {
    for (var attr in attrs) {
      attr in this.el ? this.el[attr] = attrs[attr] : this.el.setAttribute(attr, attrs[attr]);
    }
  }

}
