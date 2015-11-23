
import {indexOf} from './arrays'
var ElementProto: any = (typeof Element !== 'undefined' && Element.prototype) || {};

var matchesSelector = ElementProto.matches ||
  ElementProto.webkitMatchesSelector ||
  ElementProto.mozMatchesSelector ||
  ElementProto.msMatchesSelector ||
  ElementProto.oMatchesSelector || function(selector) {
    var nodeList = (this.parentNode || document).querySelectorAll(selector) || [];
    return !!~indexOf(nodeList, this);
  }

var elementAddEventListener = ElementProto.addEventListener || function(eventName, listener) {
  return this.attachEvent('on' + eventName, listener);
}
var elementRemoveEventListener = ElementProto.removeEventListener || function(eventName, listener) {
  return this.detachEvent('on' + eventName, listener);
}

const transitionEndEvent = (function transitionEnd() {
  var el = document.createElement('bootstrap')

  var transEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd otransitionend',
    'transition': 'transitionend'
  }

  for (var name in transEndEventNames) {
    if (el.style[name] !== undefined) {
      return transEndEventNames[name]
    }
  }

  return null
});

const animationEndEvent = (function animationEnd() {
  var el = document.createElement('bootstrap')

  var transEndEventNames = {
    'WebkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'animationend',
    'OAnimation': 'oAnimationEnd oanimationend',
    'animation': 'animationend'
  }

  for (var name in transEndEventNames) {
    if (el.style[name] !== undefined) {
      return transEndEventNames[name]
    }
  }

  return null
});


export function matches(elm, selector): boolean {
  return matchesSelector.call(elm, selector)
}

export function addEventListener(elm: Element, eventName: string, listener, useCap: boolean = false) {
  elementAddEventListener.call(elm, eventName, listener, useCap)
}

export function removeEventListener(elm: Element, eventName: string, listener) {
  elementRemoveEventListener.call(elm, eventName, listener)
}

const unbubblebles = 'focus blur change'.split(' ');
let domEvents = [];

export function delegate(elm: HTMLElement | string, selector: string, eventName: string, callback, ctx?): Function {
  let root = elm
  let handler = function(e) {
    let node = e.target || e.srcElement;

    // Already handled
    if (e.delegateTarget) return;

    for (; node && node != root; node = node.parentNode) {
      if (matches(node, selector)) {

        e.delegateTarget = node;
        callback(e);
      }
    }
  }

  let useCap = !!~unbubblebles.indexOf(eventName)
  addEventListener(<HTMLElement>elm, eventName, handler, useCap);
  domEvents.push({ eventName: eventName, handler: handler, listener: callback, selector: selector });
  return handler;
}

export function undelegate(elm: HTMLElement | string, selector: string, eventName: string, callback) {
  /*if (typeof selector === 'function') {
      listener = <Function>selector;
      selector = null;
    }*/

  var handlers = domEvents.slice();
  for (var i = 0, len = handlers.length; i < len; i++) {
    var item = handlers[i];

    var match = item.eventName === eventName &&
      (callback ? item.listener === callback : true) &&
      (selector ? item.selector === selector : true);

    if (!match) continue;

    removeEventListener(<HTMLElement>elm, item.eventName, item.handler);
    domEvents.splice(indexOf(handlers, item), 1);
  }
}


export function addClass(elm: HTMLElement, className: string) {
  if (elm.classList)
    elm.classList.add(className)
  else {
    elm.className = elm.className.split(' ').concat(className.split(' ')).join(' ')
  }
}
export function removeClass(elm: HTMLElement, className: string) {
  if (elm.classList)
    elm.classList.remove(className)
  else {
    let split = elm.className.split(' '),
      classNames = className.split(' '),
      tmp = split, index

    for (let i = 0, ii = classNames.length; i < ii; i++) {
      index = split.indexOf(classNames[i])
      if (!!~index) split = split.splice(index, 1)
    }
  }
}

export function hasClass(elm: HTMLElement, className: string) {
  if (elm.classList) {
    return elm.classList.contains(className);
  }
  var reg = new RegExp('\b' + className)
  return reg.test(elm.className)
}

export function selectionStart(elm: HTMLInputElement): number {
  if ('selectionStart' in elm) {
    // Standard-compliant browsers
    return elm.selectionStart;
  } else if ((<any>document).selection) {
    // IE
    elm.focus();
    var sel = (<any>document).selection.createRange();
    var selLen = (<any>document).selection.createRange().text.length;
    sel.moveStart('character', -elm.value.length);
    return sel.text.length - selLen;
  }
}

var _events = {
  animationEnd: null,
  transitionEnd: null
};

export function transitionEnd(elm: Element, fn: (event: TransitionEvent) => void, ctx?: any, duration?: number) {
  var event = _events.transitionEnd || (_events.transitionEnd = transitionEndEvent());
  var callback = function(e) {
    removeEventListener(elm, event, callback);
    fn.call(ctx, e);
  };
  addEventListener(elm, event, callback);
}

export function animationEnd(elm: Element, fn: (event: AnimationEvent) => void, ctx?: any, duration?: number) {
  var event = _events.animationEnd || (_events.animationEnd = animationEndEvent());
  var callback = function(e) {
    removeEventListener(elm, event, callback);
    fn.call(ctx, e);
  };
  addEventListener(elm, event, callback);
}

export const domReady = (function() {
  var fns = [], listener
    , doc = document
    , hack = (<any>doc.documentElement).doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded: boolean = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded) {
    doc.addEventListener(domContentLoaded, listener = function() {
      doc.removeEventListener(domContentLoaded, listener)
      loaded = true

      while (listener = fns.shift()) listener()
    })
  }

  return function(fn) {
    loaded ? setTimeout(fn, 0) : fns.push(fn)
  }
});