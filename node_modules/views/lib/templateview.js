var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var views = require('./view');
var debug_1 = require('./debug');
var debug = debug_1.logger('templateview');
var TemplateView = (function (_super) {
    __extends(TemplateView, _super);
    /** TemplateView
     * @param {TemplateViewOptions} options
     * @extends View
     */
    function TemplateView(options) {
        if (options && options.template) {
            this.template = options.template;
        }
        _super.call(this, options);
    }
    TemplateView.prototype.getTemplateData = function () {
        return {};
    };
    TemplateView.prototype.render = function (options) {
        if (options === void 0) { options = {}; }
        if (!options.silent)
            this.triggerMethod('before:render');
        this.renderTemplate(this.getTemplateData());
        if (!options.silent)
            this.triggerMethod('render');
        return this;
    };
    TemplateView.prototype.renderTemplate = function (data) {
        var template = this.getOption('template');
        if (typeof template === 'function') {
            debug('%s render template function', this.cid);
            template = template.call(this, data);
        }
        if (template && typeof template === 'string') {
            debug('%s attach template: %s', this.cid, template);
            this.attachTemplate(template);
        }
    };
    TemplateView.prototype.attachTemplate = function (template) {
        this.undelegateEvents();
        this.el.innerHTML = template;
        this.delegateEvents();
    };
    return TemplateView;
})(views.View);
exports.TemplateView = TemplateView;
