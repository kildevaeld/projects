var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var templateview_1 = require('./templateview');
var utilities_1 = require('utilities');
var DataView = (function (_super) {
    __extends(DataView, _super);
    /**
     * DataView
     * @param {DataViewOptions} options
     * @extends TemplateView
     */
    function DataView(options) {
        if (options === void 0) { options = {}; }
        if (options.model) {
            this.model = options.model;
        }
        if (options.collection) {
            this.collection = options.collection;
        }
        _super.call(this, options);
    }
    Object.defineProperty(DataView.prototype, "model", {
        get: function () { return this._model; },
        set: function (model) {
            this.setModel(model);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataView.prototype, "collection", {
        get: function () { return this._collection; },
        set: function (collection) {
            this.setCollection(collection);
        },
        enumerable: true,
        configurable: true
    });
    DataView.prototype.setModel = function (model) {
        if (this._model === model)
            return;
        this.triggerMethod('before:model', this._model, model);
        if (this._model) {
            this.stopListening(this._model);
        }
        this._model = model;
        this.triggerMethod('model', model);
    };
    DataView.prototype.setCollection = function (collection) {
        if (this._collection === collection)
            return;
        this.triggerMethod('before:collection', this._collection, collection);
        if (this._collection) {
            this.stopListening(this._collection);
        }
        this._collection = collection;
        this.triggerMethod('collection', collection);
    };
    DataView.prototype.getTemplateData = function () {
        return this.model ?
            typeof this.model.toJSON === 'function' ?
                this.model.toJSON() : this.model : {};
    };
    DataView.prototype.delegateEvents = function (events) {
        events = events || this.events;
        //events = normalizeUIKeys(events)
        var _a = this._filterEvents(events), c = _a.c, e = _a.e, m = _a.m;
        _super.prototype.delegateEvents.call(this, e);
        this._delegateDataEvents(m, c);
        return this;
    };
    DataView.prototype.undelegateEvents = function () {
        this._undelegateDataEvents();
        _super.prototype.undelegateEvents.call(this);
        return this;
    };
    DataView.prototype._delegateDataEvents = function (model, collection) {
        var _this = this;
        this._dataEvents = {};
        var fn = function (item, ev) {
            if (!_this[item])
                return {};
            var out = {}, k, f;
            for (k in ev) {
                f = utilities_1.bind(ev[k], _this);
                _this[item].on(k, f);
                out[item + ":" + k] = f;
            }
            return out;
        };
        utilities_1.extend(this._dataEvents, fn('model', model), fn('collection', collection));
    };
    DataView.prototype._undelegateDataEvents = function () {
        if (!this._dataEvents)
            return;
        var k, v;
        for (k in this._dataEvents) {
            v = this._dataEvents[k];
            var _a = k.split(':'), item = _a[0], ev = _a[1];
            if (!this[item])
                continue;
            this[item].off(ev, v);
        }
        delete this._dataEvents;
    };
    DataView.prototype._filterEvents = function (obj) {
        /*jshint -W030 */
        var c = {}, m = {}, e = {}, k, v;
        for (k in obj) {
            var _a = k.split(' '), ev = _a[0], t = _a[1];
            ev = ev.trim(), t = t ? t.trim() : "", v = obj[k];
            if (t === 'collection') {
                c[ev] = v;
            }
            else if (t === 'model') {
                m[ev] = v;
            }
            else {
                e[k] = v;
            }
        }
        return { c: c, m: m, e: e };
    };
    return DataView;
})(templateview_1.TemplateView);
exports.DataView = DataView;
