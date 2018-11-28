const { body, param } = require('express-validator/check')

var Responder = require('../core/responder');
var responder = new Responder();

var Database = require('../core/database');
var connection = new Database();

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
        const attributes = [req.body.name, req.body.queue_id];

        var queue;

        req.getValidationResult().then(result => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            // get queue
            return connection.query(
                'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
                [req.body.queue_id]
            );
        }).then(results => {
            queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // get all nodes active on queue
            return connection.query(
                'SELECT * FROM Queue LEFT JOIN Node ON Queue.id = Node.queue_id WHERE Node.serviced_at IS NULL AND Node.deleted_at IS NULL AND Queue.id = ?',
                [req.body.queue_id]
            );
        }).then(results => {
            if (queue.capacity && results.length >= queue.capacity) {
                throw new QueueAtCapacityError();
            }
            // create the node
            return connection.query(
                'INSERT INTO Node(name, queue_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP(3))',
                attributes
            );
        }).then(results => {
            // get inserted node
            return connection.query(
                'SELECT * FROM Node WHERE id = ?',
                [results.insertId]
            );
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
            return connection.query(
                'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
                [req.params.nodeId]
            )
        }).then(results => {
            // check node exists and is not deleted
            var node = results[0];
            if (!node) {
                throw new NodeNotFoundError();
            }
            // delete the node
            return connection.query(
                'UPDATE Node SET deleted_at = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [req.params.nodeId]
            );
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
            return connection.query(
                'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
                [req.params.nodeId]
            )
        }).then(results => {
            // check node exists and is not deleted
            var node = results[0];
            if (!node) {
                throw new NodeNotFoundError();
            } else if (node.serviced_at) {
                throw new NodePreviouslyServiced();
            }
            // delete the node
            return connection.query(
                'UPDATE Node SET serviced_at = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [req.params.nodeId]
            );
        }).then(results => {
            console.log(results);
            return connection.query(
                'SELECT * FROM Node WHERE id = ?',
                [req.params.nodeId]
            );
        }).then(results => {
            console.log(results);
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
