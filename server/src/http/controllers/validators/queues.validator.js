const { body, param } = require('express-validator/check')

exports.validate = function validate(method) {
    switch (method) {
        case 'getOne': {
            return [
                param('queueId', 'queue_id must be an int').isInt(),
            ]
        }
        case 'createQueue': {
            return [
                body('name', 'name does not exist').isString(),
            ]
        }
        case 'deleteQueue': {
            return [
                param('queueId', 'queue_id must be a int').isInt(),
            ]
        }
        case 'getNodes': {
            return [
                param('queueId', 'queue_id must be a int').isInt(),
            ]
        }
        default: {
            return () => true;
        }
    }
};
