/// <reference path="interfaces" />
import {EventEmitter} from 'eventsjs'
import {IModel,ICollection} from './interfaces'
import {uniqueId, equal} from 'utilities/lib/utils'
import {has, extend, isEmpty, isObject} from 'utilities/lib/objects'
import {Model, ModelSetOptions} from './model'
/**
 * Takes a nested object and returns a shallow object keyed with the path names
 * e.g. { "level1.level2": "value" }
 *
 * @param  {Object}      Nested object e.g. { level1: { level2: 'value' } }
 * @return {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
 */
function objToPaths(obj:Object, separator:string = ".") {
	var ret = {};

	for (var key in obj) {
		var val = obj[key];

		if (val && (val.constructor === Object || val.constructor === Array) && !isEmpty(val)) {
			//Recursion for embedded objects
			var obj2 = objToPaths(val);

			for (var key2 in obj2) {
				var val2 = obj2[key2];

				ret[key + separator + key2] = val2;
			}
		} else {
			ret[key] = val;
		}
	}

	return ret;
}

/**
 * [getNested description]
 * @param  {object} obj           to fetch attribute from
 * @param  {string} path          path e.g. 'user.name'
 * @param  {[type]} return_exists [description]
 * @return {mixed}                [description]
 */
function getNested(obj, path, return_exists?, separator:string = ".") {
	
	var fields = path ? path.split(separator) : [];
	var result = obj;
	return_exists || (return_exists === false);
	for (var i = 0, n = fields.length; i < n; i++) {
		if (return_exists && !has(result, fields[i])) {
			return false;
		}
		
		result = result instanceof Model ? result.get(fields[i]) : result[fields[i]];

		if (result == null && i < n - 1) {
			result = {};
		}


		if (typeof result === 'undefined') {
			if (return_exists) {
				return true;
			}
			return result;
		}
	}
	if (return_exists) {
		return true;
	}
	return result;
}


/**
 * @param {Object} obj                Object to fetch attribute from
 * @param {String} path               Object path e.g. 'user.name'
 * @param {Object} [options]          Options
 * @param {Boolean} [options.unset]   Whether to delete the value
 * @param {Mixed}                     Value to set
 */
function setNested(obj, path, val, options?) {
	options = options || {};

	var separator = options.separator || "."

	var fields = path ? path.split(separator) : [];
	var result = obj;
	for (var i = 0, n = fields.length; i < n && result !== undefined; i++) {
		var field = fields[i];

		//If the last in the path, set the value
		if (i === n - 1) {
			options.unset ? delete result[field] : result[field] = val;
		} else {
			//Create the child object if it doesn't exist, or isn't an object
			if (typeof result[field] === 'undefined' || !isObject(result[field])) {
				// If trying to remove a field that doesn't exist, then there's no need
				// to create its missing parent (doing so causes a problem with
				// hasChanged()).
				if (options.unset) {
					delete result[field]; // in case parent exists but is not an object
					return;
				}
				var nextField = fields[i + 1];

				// create array if next field is integer, else create object
				result[field] = /^\d+$/.test(nextField) ? [] : {};
			}

			//Move onto the next part of the path
			result = result[field];
		}
	}
}

function deleteNested(obj, path) {
	setNested(obj, path, null, {
		unset: true
	});
}

export class NestedModel extends Model {
	static keyPathSeparator = '.'
	
	
	// Override get
	// Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
	get (attr) {
		return getNested(this._attributes, attr);
	}

	// Override set
	// Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
	set (key:string|Object, val?:any, options?:ModelSetOptions): NestedModel {
		var attr, attrs, unset, changes, silent, changing, prev, current;
		if (key == null) return this;

		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (typeof key === 'object') {
			attrs = key;
			options = val || {};
		} else {
			(attrs = {})[<string>key] = val;
		}

		options || (options = {});

		// Run validation.
		//if (!this._validate(attrs, options)) return false;

		// Extract attributes and options.
		unset = options.unset;
		silent = options.silent;
		changes = [];
		changing = (<any>this)._changing;
		(<any>this)._changing = true;

		if (!changing) {
			(<any>this)._previousAttributes = extend({}, this._attributes); //<custom>: Replaced _.clone with _.deepClone
			(<any>this)._changed = {};
		}
		current = this._attributes, prev = (<any>this)._previousAttributes;

		// Check for changes of `id`.
		if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

		//<custom code>
		attrs = objToPaths(attrs);
		//</custom code>

		// For each `set` attribute, update or delete the current value.
		for (attr in attrs) {
			val = attrs[attr];

			//<custom code>: Using getNested, setNested and deleteNested
			if (!equal(getNested(current, attr), val)) {
				changes.push(attr);
				(<any>this)._changed[attr] = val
			}
			if (!equal(getNested(prev, attr), val)) {
				setNested(this.changed, attr, val);
			} else {
				deleteNested(this.changed, attr);
			}
			unset ? deleteNested(current, attr) : setNested(current, attr, val);
			//</custom code>
		}

		// Trigger all relevant attribute changes.
		if (!silent) {
			if (changes.length) (<any>this)._pending = true;
			
			//<custom code>
			var separator = NestedModel.keyPathSeparator;
			var alreadyTriggered = {}; // * @restorer

			for (var i = 0, l = changes.length; i < l; i++) {
				let key = changes[i];

				if (!alreadyTriggered.hasOwnProperty(key) || !alreadyTriggered[key]) { // * @restorer
					alreadyTriggered[key] = true; // * @restorer
					this.trigger('change:' + key, this, getNested(current, key), options);
				} // * @restorer

				var fields = key.split(separator);

				//Trigger change events for parent keys with wildcard (*) notation
				for (var n = fields.length - 1; n > 0; n--) {
					var parentKey = fields.slice(0, n).join(separator),
						wildcardKey = parentKey + separator + '*';

					if (!alreadyTriggered.hasOwnProperty(wildcardKey) || !alreadyTriggered[wildcardKey]) { // * @restorer
						alreadyTriggered[wildcardKey] = true; // * @restorer
						this.trigger('change:' + wildcardKey, this, getNested(current, parentKey), options);
					} // * @restorer

					// + @restorer
					if (!alreadyTriggered.hasOwnProperty(parentKey) || !alreadyTriggered[parentKey]) {
						alreadyTriggered[parentKey] = true;
						this.trigger('change:' + parentKey, this, getNested(current, parentKey), options);
					}
					// - @restorer
				}
				//</custom code>
			}
		}

		if (changing) return this;
		if (!silent) {
			while ((<any>this)._pending) {
				(<any>this)._pending = false;
				
				this.trigger('change', this, options);
			}
		}
		(<any>this)._pending = false;
		(<any>this)._changing = false;
		return this;
	}

	// Clear all attributes on the model, firing `"change"` unless you choose
	// to silence it.
	clear (options) {
		var attrs = {};
		var shallowAttributes = objToPaths(this._attributes);
		for (var key in shallowAttributes) attrs[key] = void 0;
		return this.set(attrs, extend({}, options, {
			unset: true
		}));
	}

	// Determine if the model has changed since the last `"change"` event.
	// If you specify an attribute name, determine if that attribute has changed.
	hasChanged (attr?) {
		if (attr == null) {
			return !Object.keys(this.changed).length;
		}
		return getNested(this.changed, attr) !== undefined;
	}

	// Return an object containing all the attributes that have changed, or
	// false if there are no changed attributes. Useful for determining what
	// parts of a view need to be updated and/or what attributes need to be
	// persisted to the server. Unset attributes will be set to undefined.
	// You can also pass an attributes object to diff against the model,
	// determining if there *would be* a change.
	changedAttributes (diff) {
		//<custom code>: objToPaths
		if (!diff) return this.hasChanged() ? objToPaths(this.changed) : false;
		//</custom code>

		var old = (<any>this)._changing ? (<any>this)._previousAttributes : this._attributes;

		//<custom code>
		diff = objToPaths(diff);
		old = objToPaths(old);
		//</custom code>

		var val, changed = false;
		for (var attr in diff) {
			if (equal(old[attr], (val = diff[attr]))) continue;
			(changed || (changed = <any>{}))[attr] = val;
		}
		return changed;
	}

	// Get the previous value of an attribute, recorded at the time the last
	// `"change"` event was fired.
	previous (attr) {
		if (attr == null || !(<any>this)._previousAttributes) {
			return null;
		}
		//<custom code>
		return getNested((<any>this)._previousAttributes, attr);
		//</custom code>
	}

	// Get all of the attributes of the model at the time of the previous
	// `"change"` event.
	previousAttributes () {
		return extend({}, (<any>this)._previousAttributes);
	}	
}