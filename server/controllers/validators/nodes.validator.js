const { body, param } = require('express-validator/check')

exports.validate = function validate(method) {
    switch (method) {
        case 'getOne': {
            return [
                param('nodeId', 'node_id must be an int').isInt(),
            ]
        }
        case 'createNode': {
            return [
                body('name', 'name does not exist').exists().isString(),
                body('queue_id', 'queue_id does not exist').exists().isInt(),
            ]
        }
        case 'deleteNode': {
            return [
                param('nodeId', 'node_id must be a int').isInt(),
            ]
        }
        case 'service': {
            return [
                param('nodeId', 'node_id must be a int').isInt(),
            ]
        }
        default: {
            return () => true;
        }
    }
};
