const { body, param } = require('express-validator/check')

exports.validate = function validate(method) {
    switch (method) {
        case 'get': {
            return [
                param('userId', 'user_id must be an int').exists().isInt(),
            ]
        }
        case 'register': {
            return [
                body('username', 'username must be a string').exists().isString(),
                body('password', 'password must be a string').exists().isString(),
            ];
        }
        case 'login': {
            return [
                body('username', 'username must be a string').exists().isString(),
                body('password', 'password must be a string').exists().isString(),
            ]
        }
        case 'whoami': {
            return [
                body('id', 'id must be an int').exists().isInt(),
            ]
        }
        default: {
            return [];
        }
    }
};
