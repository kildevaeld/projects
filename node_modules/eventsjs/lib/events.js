var idCounter = 0;
function getID() {
    return "" + (++idCounter);
}
function callFunc(fn, ctx, args) {
    if (args === void 0) { args = []; }
    var l = fn.length, i = -1, a1 = args[0], a2 = args[1], a3 = args[2], a4 = args[3];
    switch (args.length) {
        case 0:
            while (++i < l)
                fn[i].call(ctx);
            return;
        case 1:
            while (++i < l)
                fn[i].call(ctx, a1);
            return;
        case 2:
            while (++i < l)
                fn[i].call(ctx, a1, a2);
            return;
        case 3:
            while (++i < l)
                fn[i].call(ctx, a1, a2, a3);
            return;
        case 4:
            while (++i < l)
                fn[i].call(ctx, a1, a2, a3, a4);
            return;
        default:
            while (++i < l)
                fn[i].apply(ctx, args);
            return;
    }
}
exports.callFunc = callFunc;
var EventEmitter = (function () {
    function EventEmitter() {
    }
    Object.defineProperty(EventEmitter.prototype, "listeners", {
        get: function () {
            return this._listeners;
        },
        enumerable: true,
        configurable: true
    });
    EventEmitter.prototype.on = function (event, fn, ctx, once) {
        if (once === void 0) { once = false; }
        var events = (this._listeners || (this._listeners = {}))[event] || (this._listeners[event] = []);
        events.push({
            name: event,
            once: once,
            handler: fn.bind(ctx || this) /*,
            ctx: ctx||this*/
        });
        return this;
    };
    EventEmitter.prototype.once = function (event, fn, ctx) {
        return this.on(event, fn, ctx, true);
    };
    EventEmitter.prototype.off = function (eventName, fn) {
        this._listeners = this._listeners || {};
        if (eventName == null) {
            this._listeners = {};
        }
        else if (this._listeners[eventName]) {
            var events = this._listeners[eventName];
            if (fn == null) {
                this._listeners[eventName] = [];
            }
            else {
                for (var i = 0; i < events.length; i++) {
                    var event_1 = events[i];
                    if (events[i].handler == fn) {
                        this._listeners[eventName].splice(i, 1);
                    }
                }
            }
        }
    };
    EventEmitter.prototype.trigger = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var events = (this._listeners || (this._listeners = {}))[eventName] || (this._listeners[eventName] = [])
            .concat(this._listeners['all'] || []);
        if (EventEmitter.debugCallback)
            EventEmitter.debugCallback(this.constructor.name, this.name, eventName, args);
        var event, a, len = events.length, index, i;
        var calls = [];
        for (i = 0; i < events.length; i++) {
            event = events[i];
            a = args;
            if (event.name == 'all') {
                a = [eventName].concat(args);
                callFunc([event.handler], event.ctx, a);
            }
            calls.push(event.handler);
            if (event.once === true) {
                index = this._listeners[event.name].indexOf(event);
                this._listeners[event.name].splice(index, 1);
            }
        }
        this._executeListener(calls, undefined, args);
        callFunc(calls, undefined, args);
        return this;
    };
    EventEmitter.prototype._executeListener = function (func, ctx, args) {
        var executor = callFunc;
        if (this.constructor.executeListenerFunction) {
            executor = this.constructor.executeListenerFunction;
        }
        executor(func, ctx, args);
    };
    EventEmitter.prototype.listenTo = function (obj, event, fn, ctx, once) {
        if (once === void 0) { once = false; }
        var listeningTo, id, meth;
        listeningTo = this._listeningTo || (this._listeningTo = {});
        id = obj.listenId || (obj.listenId = getID());
        listeningTo[id] = obj;
        meth = once ? 'once' : 'on';
        obj[meth](event, fn, this);
        return this;
    };
    EventEmitter.prototype.listenToOnce = function (obj, event, fn, ctx) {
        return this.listenTo(obj, event, fn, ctx, true);
    };
    EventEmitter.prototype.stopListening = function (obj, event, callback) {
        var listeningTo = this._listeningTo || {};
        var remove = !event && !callback;
        if (obj)
            listeningTo[obj.listenId] = obj;
        for (var id in listeningTo) {
            obj = listeningTo[id];
            obj.off(event, callback, this);
            if (remove || !Object.keys(obj.listeners).length)
                delete this._listeningTo[id];
        }
        return this;
    };
    EventEmitter.prototype.destroy = function () {
        this.stopListening();
        this.off();
    };
    EventEmitter.executeListenerFunction = function () {
    };
    return EventEmitter;
})();
exports.EventEmitter = EventEmitter;
