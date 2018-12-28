const { body, param } = require('express-validator/check');

exports.validate = function validate (method) {
    switch (method) {
        case 'get': {
            return [
                param('userId', 'user_id must be an int').isInt()
            ];
        }
        case 'register': {
            return [
                body('username', 'username must be a string of length 3-30').isString().isLength({ min: 3, max: 30 }),
                body('password', 'password must be a string').isString()
            ];
        }
        case 'login': {
            return [
                body('username', 'username must be a string').isString(),
                body('password', 'password must be a string').isString()
            ];
        }
        case 'whoami': {
            return [
                body('id', 'id must be an int').isInt()
            ];
        }
        default: {
            return [];
        }
    }
};
