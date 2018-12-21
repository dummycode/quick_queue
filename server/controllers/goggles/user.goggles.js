'use strict';

var abstract_goggles = require('./abstract.goggles');

module.exports = function (user) {
    var filter = ['id', 'username', 'created_at'];
    return abstract_goggles(user, filter);
};