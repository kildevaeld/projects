var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var data_view_1 = require('./data-view');
var utilities_1 = require('utilities');
var eventsjs_1 = require('eventsjs');
var debug_1 = require('./debug');
var debug = debug_1.logger('collectionview');
var Buffer = (function () {
    function Buffer() {
        this.children = [];
        this.buffer = document.createDocumentFragment();
    }
    Buffer.prototype.append = function (view) {
        this.children.push(view);
        this.buffer.appendChild(view.el);
    };
    return Buffer;
})();
var CollectionView = (function (_super) {
    __extends(CollectionView, _super);
    /** CollectionView
   * @extends DataView
   * @param {DataViewOptions} options
   */
    function CollectionView(options) {
        //this._options = options||{}
        this.children = [];
        this.sort = (options && options.sort != null) ? options.sort : true;
        _super.call(this, options);
    }
    /**
   * Render the collection view and alle of the children
   * @return {CollectionView}
   *
   */
    CollectionView.prototype.render = function (options) {
        this.destroyChildren();
        this._destroyContainer();
        _super.prototype.render.call(this, options);
        this._initContainer();
        if (this.collection && this.collection.length) {
            this.renderCollection();
        }
        return this;
    };
    /**
     * @protected
     */
    CollectionView.prototype.setCollection = function (collection) {
        _super.prototype.setCollection.call(this, collection);
        this._delegateCollectionEvents();
    };
    CollectionView.prototype.renderCollection = function () {
        this.destroyChildren();
        if (this.collection.length != 0) {
            this.hideEmptyView();
            this._startBuffering();
            this._renderCollection();
            this._stopBuffering();
        }
        else {
            this.showEmptyView();
        }
    };
    /**
   * Returns a new instance of this.childView with attached model.
   *
   * @param {IModel} model
   * @protected
   */
    CollectionView.prototype.getChildView = function (model) {
        var View = this.getOption('childView') || data_view_1.DataView, options = this.getOption('childViewOptions') || {};
        return new View(utilities_1.extend({
            model: model
        }, options));
    };
    CollectionView.prototype.renderChildView = function (view, index) {
        this.triggerMethod('before:render:child', view);
        debug('%s render child: %s', this.cid, view.cid);
        view.render();
        this._attachHTML(view, index);
        this.triggerMethod('render:child', view);
    };
    CollectionView.prototype.showEmptyView = function () {
        var EmptyView = this.getOption('emptyView');
        if (EmptyView == null)
            return;
        var view = new EmptyView();
        this._emptyView = view;
        this._container.appendChild(view.render().el);
    };
    CollectionView.prototype.hideEmptyView = function () {
        if (!this._emptyView)
            return;
        this._emptyView.destroy();
        this._emptyView.remove();
        this._emptyView = void 0;
    };
    CollectionView.prototype.destroyChildren = function () {
        if (this._container) {
            this._container.innerHTML = '';
        }
        if (this.children.length === 0)
            return;
        this.children.forEach(this.removeChildView, this);
        this.children = [];
    };
    CollectionView.prototype.removeChildView = function (view) {
        if (!view)
            return;
        if (typeof view.destroy === 'function') {
            view.destroy();
        }
        if (typeof view.remove === 'function') {
            view.remove();
        }
        this.stopListening(view);
        //this.children.delete(view);
        this.children.splice(this.children.indexOf(view), 1);
        if (this.children.length === 0) {
            this.showEmptyView();
        }
        this._updateIndexes(view, false);
    };
    /**
   * Destroy the collection view and all of it's children
   * @see JaffaMVC.View
   * @return {JaffaMVC.View}
   */
    CollectionView.prototype.destroy = function () {
        this.triggerMethod('before:destroy:children');
        this.destroyChildren();
        this.triggerMethod('destroy:children');
        this.hideEmptyView();
        //if (this._emptyView) this.hideEmptyView();
        return _super.prototype.destroy.call(this);
    };
    CollectionView.prototype._renderCollection = function () {
        var _this = this;
        this.triggerMethod('before:render:collection');
        this.collection.forEach(function (model, index) {
            var view = _this.getChildView(model);
            _this._appendChild(view, index);
        });
        this.triggerMethod('render:collection');
    };
    /**
   * Append childview to the container
   * @private
   * @param {IDataView} view
   * @param {Number} index
   */
    CollectionView.prototype._appendChild = function (view, index) {
        this._updateIndexes(view, true, index);
        this._proxyChildViewEvents(view);
        debug('%s append child %s at index: %s', this.cid, view.cid, index);
        this.children.push(view);
        this.hideEmptyView();
        this.renderChildView(view, index);
        this.triggerMethod('add:child', view);
    };
    /**
   * Attach the childview's element to the CollectionView.
   * When in buffer mode, the view is added to a documentfragment to optimize performance
   * @param {View} view  A view
   * @param {Number} index The index in which to insert the view
   * @private
   */
    CollectionView.prototype._attachHTML = function (view, index) {
        if (this._buffer) {
            debug("%s attach to buffer: %s", this.cid, view.cid);
            this._buffer.append(view);
        }
        else {
            //if (this._isShown) {
            //  utils.triggerMethodOn(view, 'before:show');
            //}
            if (!this._insertBefore(view, index)) {
                this._insertAfter(view);
            }
        }
    };
    /**
   * Proxy event froms childview to the collectionview
   * @param {IView} view
   * @private
   */
    CollectionView.prototype._proxyChildViewEvents = function (view) {
        var prefix = this.getOption('prefix') || 'childview';
        this.listenTo(view, 'all', function () {
            var args = utilities_1.slice(arguments);
            args[0] = prefix + ':' + args[0];
            args.splice(1, 0, view);
            utilities_1.callFunc(this.triggerMethod, this, args);
        });
    };
    CollectionView.prototype._updateIndexes = function (view, increment, index) {
        if (!this.sort)
            return;
        if (increment)
            view._index = index;
        this.children.forEach(function (lView) {
            if (lView._index >= view._index) {
                increment ? lView._index++ : lView._index--;
            }
        });
    };
    CollectionView.prototype._startBuffering = function () {
        this._buffer = new Buffer();
    };
    CollectionView.prototype._stopBuffering = function () {
        this._container.appendChild(this._buffer.buffer);
        delete this._buffer;
    };
    CollectionView.prototype._initContainer = function () {
        var container = this.getOption('childViewContainer');
        if (container) {
            container = this.$(container)[0];
        }
        else {
            container = this.el;
        }
        this._container = container;
    };
    CollectionView.prototype._destroyContainer = function () {
        if (this._container)
            delete this._container;
    };
    /**
     * Internal method. Check whether we need to insert the view into
   * the correct position.
     * @param  {IView} childView [description]
     * @param  {number} index     [description]
     * @return {boolean}           [description]
     */
    CollectionView.prototype._insertBefore = function (childView, index) {
        var currentView;
        var findPosition = this.sort && (index < this.children.length - 1);
        if (findPosition) {
            // Find the view after this one
            currentView = utilities_1.find(this.children, function (view) {
                return view._index === index + 1;
            });
        }
        if (currentView) {
            this._container.insertBefore(childView.el, currentView.el);
            return true;
        }
        return false;
    };
    /**
     * Internal method. Append a view to the end of the $el
     * @private
     */
    CollectionView.prototype._insertAfter = function (childView) {
        this._container.appendChild(childView.el);
    };
    /**
     * Delegate collection events
     * @private
     */
    CollectionView.prototype._delegateCollectionEvents = function () {
        if (this.collection && this.collection instanceof eventsjs_1.EventEmitter) {
            this.listenTo(this.collection, 'add', this._onCollectionAdd);
            this.listenTo(this.collection, 'remove', this._onCollectionRemove);
            this.listenTo(this.collection, 'reset', this.render);
            if (this.sort)
                this.listenTo(this.collection, 'sort', this._onCollectionSort);
        }
    };
    // Event handlers
    /**
     * Called when a model is add to the collection
     * @param {JaffaMVC.Model|Backbone.model} model Model
     * @private
     */
    CollectionView.prototype._onCollectionAdd = function (model) {
        var view = this.getChildView(model);
        var index = this.collection.indexOf(model);
        this._appendChild(view, index);
    };
    /**
     * Called when a model is removed from the collection
     * @param {JaffaMVC.Model|Backbone.model} model Model
     * @private
     */
    CollectionView.prototype._onCollectionRemove = function (model) {
        var view = utilities_1.find(this.children, function (view) {
            return view.model === model;
        });
        this.removeChildView(view);
    };
    /**
     * Called when the collection is sorted
     * @private
     */
    CollectionView.prototype._onCollectionSort = function () {
        var _this = this;
        var orderChanged = this.collection.find(function (model, index) {
            var view = utilities_1.find(_this.children, function (view) {
                return view.model === model;
            });
            return !view || view._index !== index;
        });
        if (orderChanged)
            this.render();
    };
    return CollectionView;
})(data_view_1.DataView);
exports.CollectionView = CollectionView;
