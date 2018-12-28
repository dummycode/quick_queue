'use strict';

var abstractGoggles = require('./abstract.goggles');

module.exports = function (user) {
    var filter = ['id', 'username', 'email', 'created_at'];
    return abstractGoggles(user, filter);
};
