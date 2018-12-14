var Responder = require('../core/responder');
var responder = new Responder();

var Database = require('../core/database');
var connection = new Database();

var { Manager } = require('../managers/nodes.manager');
var manager = new Manager();

var { 
    ValidationFailedError, 
    NodeNotFoundError, 
    NodePreviouslyServiced, 
    QueueNotFoundError,
    QueueAtCapacityError,
} = require('../core/errors');

exports.Controller = class Controller {

    /**
     * Get all nodes
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getAll(req, res) {
        // logic to get all nodes
        connection.query(
            'SELECT * FROM Node WHERE deleted_at IS NULL'
        ).then(results => {
            responder.successResponse(res, results);
        }).catch(err => {
            console.log(err);
            responder.ohShitResponse(res, 'error with query');
        });

    }

    /**
     * Get a node
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getOne(req, res) {
        // logic to get one node
        req.getValidationResult().then(result => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return connection.query(
                'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
                [req.params.nodeId]
            );
        }).then(results => {
            var node = results[0];
            if (!node) {
                throw new NodeNotFoundError();
            }
            responder.successResponse(res, node);
        }).catch(err => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case NodeNotFoundError:
                    responder.notFoundResponse(res, 'node not found');
                    return;
                default:
                    console.log(err);
                    responder.ohShitResponse(res, 'unknown error occurred');
            }
        });
    }

    /**
     * Create a node
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    createNode(req, res) {
        req.getValidationResult().then(result => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return manager.createNode(req.body.name, req.body.queue_id); // throws error if borked
        }).then(results => {
            // success!
            responder.itemCreatedResponse(res, results[0], 'node created');
        }).catch(err => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case QueueNotFoundError:
                    responder.notFoundResponse(res, 'queue not found');
                    return;
                case QueueAtCapacityError:
                    responder.badRequestResponse(res, 'queue at capacity');
                    return;
                default:
                    console.log(err); 
                    responder.ohShitResponse(res, 'unknown error occurred');
                    return;
            }
        });
    }

    /**
     * Delete a node
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    deleteNode(req, res) {
        req.getValidationResult().then(result => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return manager.deleteNode(req.params.nodeId);
        }).then(_ => {
            // success!
            responder.itemDeletedResponse(res);
        }).catch(err => {
            switch (err.constructor) {
                case NodeNotFoundError:
                    responder.notFoundResponse(res, 'node not found');
                    return;
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                default:
                    console.log(err); // TODO better error logging here
                    responder.ohShitResponse(res, 'unknown error occurred');
                    return;
            }
        });
    }

    /**
     * Service a node if it is not already serviced or deleted
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    service(req, res) {
        req.getValidationResult().then(result => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return manager.serviceNode(req.params.nodeId);
        }).then(results => {
            // success!
            responder.itemUpdatedResponse(res, results[0], 'node serviced');
        }).catch(err => {
            switch (err.constructor) {
                case NodeNotFoundError:
                    responder.notFoundResponse(res, 'node not found');
                    return;
                case NodePreviouslyServiced:
                    responder.badRequestResponse(res, 'node previously serviced');
                    return;
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                default:
                    console.log(err); // TODO better error logging here
                    responder.ohShitResponse(res, 'unknown error occurred');
                    return;
            }
        });
    }
};
