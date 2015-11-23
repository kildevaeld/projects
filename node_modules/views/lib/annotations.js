var utilities_1 = require('utilities');
function attributes(attrs) {
    return function (target) {
        utilities_1.extend(target.prototype, attrs);
    };
}
exports.attributes = attributes;
function events(events) {
    return function (target) {
        target.prototype.events = events;
    };
}
exports.events = events;
function triggers(triggers) {
    return function (target) {
        target.prototype.triggers = triggers;
    };
}
exports.triggers = triggers;
