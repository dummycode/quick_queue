'use strict';

var jwt = require('jsonwebtoken');

var Responder = require('../../../core/responder');
var responder = new Responder();

var config = require('../../../core/config');

exports.isAuthenticated = function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
        return responder.unauthorizedResponse(res, 'no token provided');
    }

    jwt.verify(token, config.get('auth.secret'), function(err, decoded) {
        if (err) {
            return responder.unauthorizedResponse(res, 'failed to authenticate token');
        }
        // otherwise good to go
        req.body.user_id = decoded.id;

        return next();
    });
}

exports.isAdministrator = function (req, res, next) {
    if (false) { // TODO fix this up
        return next();
    }
    responder.unauthorizedResponse(res);
}
