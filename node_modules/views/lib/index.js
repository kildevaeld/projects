/// <reference path="typings" />
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./view'));
__export(require('./templateview'));
__export(require('./events'));
__export(require('./object'));
__export(require('./baseview'));
__export(require('./region'));
__export(require('./region-manager'));
__export(require('./layout-view'));
__export(require('./data-view'));
__export(require('./collection-view'));
__export(require('./types'));
__export(require('./annotations'));
__export(require('./debug'));
var collection_1 = require('collection');
exports.Collection = collection_1.Collection;
exports.Model = collection_1.Model;
