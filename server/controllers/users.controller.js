var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../core/config');

var Responder = require('../core/responder');
var responder = new Responder();

var Database = require('../core/database');
var connection = new Database();

var { Manager } = require('../managers/users.manager');
var manager = new Manager();

var { 
    ValidationFailedError,
    UserNotFoundError,
    UserAlreadyExistsError,
    EncryptionFailedError,
} = require('../core/errors');

var user_goggles = require('./goggles/user.goggles');

exports.Controller = class Controller {
    /**
     * Get current user
     * 
     * @param {Request} req
     * @param {Response} res
     */
    whoami(req, res) {
        req.getValidationResult().then(result => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return connection.query(
                'SELECT * FROM User WHERE id = ? AND deleted_at IS NULL',
                [req.body.user_id]
            );
        }).then(results => {
            var user = results[0];
            if (!user) {
                throw new UserNotFoundError();
            }
            return responder.successResponse(res, user_goggles(user));
        }).catch(err => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case UserNotFoundError:
                    responder.badRequestResponse(res, 'user not found');
                    return;
                default:
                    console.log(err);
                    responder.ohShitResponse(res, 'unknown error occurred');
            }
        });
    }

    /**
     * Login as a user
     * 
     * @param {Request} req
     * @param {Response} res
     */
    login(req, res) {
        req.getValidationResult().then(result => {
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return connection.query(
                'SELECT * FROM User WHERE username = ? AND deleted_at IS NULL',
                [req.body.username]
            );
        }).then(results => {
            var user = results[0];

            if (!user) {
                throw new UserNotFoundError();
            }
            
            bcrypt.compare(req.body.password, user.password, function(err, valid) {
                if (err) {
                    throw new EncryptionFailedError();
                }
                
                if (valid) {
                    var token = jwt.sign({ id: user.id }, config.get('auth.secret'), {
                        expiresIn: config.get('auth.timeout'),
                    });
                    responder.itemCreatedResponse(res, [user_goggles(user), token]);
                } else {
                    responder.unauthorizedResponse(res, 'invalid password');
                }
            });
        }).catch(err => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case UserNotFoundError:
                    responder.badRequestResponse(res, 'user not found');
                    return;
                case EncryptionFailedError:
                    responder.ohShitResponse(res, 'encryption failed');
                    return;
                default:
                    console.log(err);
                    responder.ohShitResponse(res, 'unknown error occurred');
                    return;
            }
        });
    }

    /**
     * Register a user
     */
    register(req, res) {
        req.getValidationResult().then(result => {
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return manager.createUser(req.body.username, req.body.password);
        }).then(results => {
            var user = results[0];
            if (!user) {
                throw new Error('user creation failed for some reason');
            }
            var token = jwt.sign({ id: user.id }, config.get('auth.secret'), {
                expiresIn: config.get('auth.timeout'),
            });
            responder.itemCreatedResponse(res, [user_goggles(user), token]);
        }).catch(err => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case UserAlreadyExistsError:
                    responder.badRequestResponse(res, 'user already exists');
                    return;
                default:
                    console.log(err);
                    responder.ohShitResponse(res, 'unknown error occurred');
                    return;
            }
        })
    }
};

