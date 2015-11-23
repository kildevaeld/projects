var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var object_1 = require('./object');
var utils_1 = require('utilities/lib/utils');
var objects_1 = require('utilities/lib/objects');
var Model = (function (_super) {
    __extends(Model, _super);
    function Model(attributes, options) {
        if (attributes === void 0) { attributes = {}; }
        options = options || {};
        this._attributes = attributes;
        this.uid = utils_1.uniqueId('uid');
        this._changed = {};
        this.collection = options.collection;
        _super.call(this);
    }
    Object.defineProperty(Model.prototype, "id", {
        get: function () {
            if (this.idAttribute in this._attributes)
                return this._attributes[this.idAttribute];
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.set = function (key, val, options) {
        if (options === void 0) { options = {}; }
        var attr, attrs = {}, unset, changes, silent, changing, prev, current;
        if (key == null)
            return this;
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        }
        else {
            attrs[key] = val;
        }
        options || (options = {});
        unset = options.unset;
        silent = options.silent;
        changes = [];
        changing = this._changing;
        this._changing = true;
        if (!changing) {
            this._previousAttributes = objects_1.extend(Object.create(null), this._attributes);
            this._changed = {};
        }
        current = this._attributes, prev = this._previousAttributes;
        for (attr in attrs) {
            val = attrs[attr];
            if (!utils_1.equal(current[attr], val))
                changes.push(attr);
            if (!utils_1.equal(prev[attr], val)) {
                this._changed[attr] = val;
            }
            else {
                delete this._changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
        }
        if (!silent) {
            if (changes.length)
                this._pending = !!options;
            for (var i = 0, l = changes.length; i < l; i++) {
                this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
        }
        if (changing)
            return this;
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
    };
    Model.prototype.get = function (key) {
        return this._attributes[key];
    };
    Model.prototype.unset = function (key, options) {
        this.set(key, void 0, objects_1.extend({}, options, { unset: true }));
    };
    Model.prototype.has = function (attr) {
        return this.get(attr) != null;
    };
    Model.prototype.hasChanged = function (attr) {
        if (attr == null)
            return !!Object.keys(this.changed).length;
        return objects_1.has(this.changed, attr);
    };
    Model.prototype.clear = function (options) {
        var attrs = {};
        for (var key in this._attributes)
            attrs[key] = void 0;
        return this.set(attrs, objects_1.extend({}, options, { unset: true }));
    };
    Object.defineProperty(Model.prototype, "changed", {
        get: function () {
            return objects_1.extend({}, this._changed);
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.changedAttributes = function (diff) {
        if (!diff)
            return this.hasChanged() ? objects_1.extend(Object.create(null), this.changed) : false;
        var val, changed = {};
        var old = this._changing ? this._previousAttributes : this._attributes;
        for (var attr in diff) {
            if (utils_1.equal(old[attr], (val = diff[attr])))
                continue;
            (changed || (changed = {}))[attr] = val;
        }
        return changed;
    };
    Model.prototype.previous = function (attr) {
        if (attr == null || !this._previousAttributes)
            return null;
        return this._previousAttributes[attr];
    };
    Model.prototype.previousAttributes = function () {
        return objects_1.extend(Object.create(null), this._previousAttributes);
    };
    Model.prototype.toJSON = function () {
        return JSON.parse(JSON.stringify(this._attributes));
    };
    Model.prototype.clone = function () {
        return new (this.constructor)(this._attributes);
    };
    return Model;
})(object_1.BaseObject);
exports.Model = Model;
