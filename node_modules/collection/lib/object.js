var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var eventsjs_1 = require('eventsjs');
var utils_1 = require('utilities/lib/utils');
var BaseObject = (function (_super) {
    __extends(BaseObject, _super);
    function BaseObject() {
        _super.apply(this, arguments);
    }
    BaseObject.extend = function (proto, stat) {
        return utils_1.inherits(this, proto, stat);
    };
    return BaseObject;
})(eventsjs_1.EventEmitter);
exports.BaseObject = BaseObject;
