
var idCounter = 0
function getID (): string {
  return "" + (++idCounter)
}

export interface EventHandler {
  (...args: any[])
}

export interface Events {
  name: string
  once: boolean
  handler: EventHandler
  ctx?: any
}

export interface IEventEmitter {
  listeners: {[key: string]: Events[]}
  listenId: string
  on (event: string, fn:EventHandler, ctx?:any): any
  once(event: string, fn:EventHandler, ctx?:any): any
  off (event: string, fn?:EventHandler, ctx?:any): any
  trigger (event: string, ...args:any[]): any
}

export interface Destroyable {
  destroy()
}

export function callFunc (fn:Function[],ctx?:any,args:any[] = []) {
  let l = fn.length, i = -1, a1 = args[0], a2 = args[1],
    a3 = args[2], a4 = args[3];

   switch (args.length) {
     case 0: while (++i < l) fn[i].call(ctx); return;
     case 1: while (++i < l) fn[i].call(ctx, a1); return;
     case 2: while (++i < l) fn[i].call(ctx, a1, a2); return;
     case 3: while (++i < l) fn[i].call(ctx, a1, a2, a3); return;
     case 4: while (++i < l) fn[i].call(ctx, a1, a2, a3, a4); return;
     default: while (++i < l) fn[i].apply(ctx, args); return;
   }
}


export class EventEmitter implements IEventEmitter, Destroyable {
  static debugCallback: (className:string, name:string, event:string, args:any[]) => void
  static executeListenerFunction: (func:Function[], ctx:any, args?: any[]) => void = function () {

  }

  listenId: string
  private _listeners: { [key: string]: Events[] }
  private _listeningTo: { [key: string]: any }

  public get listeners (): {[key: string]: Events[]} {
    return this._listeners
  }
  on (event: string, fn:EventHandler, ctx?:any, once:boolean = false): any {
    let events = (this._listeners|| (this._listeners = {}))[event]||(this._listeners[event]=[])

    events.push({
      name: event,
      once: once,
      handler: fn.bind(ctx||this)/*,
      ctx: ctx||this*/
    })
    return this
  }

  once (event: string, fn:EventHandler, ctx?:any): any {
    return this.on(event, fn, ctx, true)
  }

  off (eventName?: string, fn?:EventHandler): any {
      this._listeners = this._listeners || {};
    if (eventName == null) {
      this._listeners = {}
    } else if (this._listeners[eventName]){
      let events = this._listeners[eventName]
      if (fn == null) {
        this._listeners[eventName] = []
      } else {
        for (let i=0;i<events.length;i++) {
          let event = events[i]
          if (events[i].handler == fn) {
            this._listeners[eventName].splice(i,1)
          }
        }
      }

    }

  }

  trigger (eventName: string, ...args:any[]): any {
    let events = (this._listeners|| (this._listeners = {}))[eventName]||(this._listeners[eventName]=[])
    .concat(this._listeners['all']||[])

    if (EventEmitter.debugCallback)
      EventEmitter.debugCallback((<any>this.constructor).name, (<any>this).name, eventName, args)

    let event, a, len = events.length, index, i
    let calls: Function[] = []
    for (i=0;i<events.length;i++) {
      event = events[i]
      a = args

      if (event.name == 'all') {
        a = [eventName].concat(args)
        callFunc([event.handler], event.ctx, a);
      }

      calls.push(event.handler)


      if (event.once === true) {

        index = this._listeners[event.name].indexOf(event)
        this._listeners[event.name].splice(index,1)
      }
    }
    this._executeListener(calls, undefined, args);
    callFunc(calls, undefined, args);

    return this

  }

  _executeListener(func: Function[], ctx: any, args?: any[]) {
      let executor = callFunc;
      if ((<any>this.constructor).executeListenerFunction) {
         executor = (<any>this.constructor).executeListenerFunction
      }
      executor(func, ctx, args);
  }

  listenTo (obj: IEventEmitter, event: string, fn:EventHandler, ctx?:any, once:boolean = false): any {
      let listeningTo, id, meth
      listeningTo = this._listeningTo|| (this._listeningTo = {});
      id = obj.listenId || (obj.listenId = getID())
      listeningTo[id] = obj;
      meth = once ? 'once' : 'on';

      obj[meth](event, fn, this);

      return this;
  }

  listenToOnce (obj: IEventEmitter, event: string, fn:EventHandler, ctx?:any): any {
    return this.listenTo(obj, event, fn, ctx, true)
  }

  stopListening (obj?: IEventEmitter, event?:string, callback?:EventHandler) {
      let listeningTo = this._listeningTo||{};

      var remove = !event && !callback;
      if (obj) listeningTo[obj.listenId] = obj;

      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(event, callback, this);

        if (remove || !Object.keys(obj.listeners).length) delete this._listeningTo[id];
      }
      return this;
  }

  destroy () {
    this.stopListening();
    this.off();
  }
}
