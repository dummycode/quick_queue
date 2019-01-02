'use strict';

var jwt = require('jsonwebtoken');

var Responder = require('../../../core/responder');
var responder = new Responder();

var config = require('../../../core/config');

const Database = require('../../../core/database');
const connection = new Database();

const {
    UserNotFoundException
} = require('../../../core/errors');

exports.isAuthenticated = function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
        return responder.unauthorizedResponse(res, 'no token provided');
    }

    jwt.verify(token, config.get('auth.secret'), function (err, decoded) {
        if (err) {
            return responder.unauthorizedResponse(res, 'failed to authenticate token');
        }
        // otherwise, good to go
        connection.query(
            'SELECT * FROM User WHERE id = ?', [decoded.id]
        ).then((results) => {
            var user = results[0];
            if (!user) {
                throw new UserNotFoundException();
            }
            // set user in request payload
            req.body.user = user;
            return next();
        }).catch((err) => {
            switch (err.constructor) {
                case UserNotFoundException:
                    return responder.badRequestResponse(res, 'user not found');
                default:
                    console.log(err); // TODO better error logging
                    return responder.ohShitResponse(res, 'unknown error occurred');
            }
        });
    });
};

exports.isAdministrator = function (req, res, next) {
    const user = req.body.user;

    // user not set for some reason (didn't authenticate)
    if (!user) {
        return responder.unauthorizedResponse(res);
    } else if (!user.is_admin) {
        return responder.unauthorizedResponse(res, 'user is not an admin');
    }
    // is an administrator, continue
    return next();
};
