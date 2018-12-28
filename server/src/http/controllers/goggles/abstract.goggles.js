'use strict';

module.exports = function (object, filter) {
    var filtered = {};
    for (var key in object) {
        if (filter.includes(key)) {
            filtered[key] = object[key];
        }
    }
    return filtered;
};
