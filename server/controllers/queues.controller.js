var Responder = require('../core/responder');
var responder = new Responder();

var Database = require('../core/database');
var connection = new Database();

var { 
    ValidationFailedError, 
    QueueNotFoundError,
    QueueEmptyError,
} = require('../core/errors');

exports.Controller = class Controller {

    /**
     * Get all queues
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getAll(req, res) {
        // logic to get all queues
        connection.query(
            'SELECT * FROM Queue WHERE deleted_at IS NULL'
        ).then(results => {
            responder.successResponse(res, results);
        }).catch(err => {
            console.log(err);
            responder.ohShitResponse(res, 'error with query');
        });
    }

    /**
     * Get one queue
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getOne(req, res) {
        // logic to get one queue
        var queue;

        req.getValidationResult().then(result => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then(results => {
            queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            return connection.query(
                'SELECT * FROM Node WHERE queue_id = ? AND serviced_at IS NULL AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then(results => {
            queue.nodes = results;
            responder.successResponse(res, queue);
        }).catch(err => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case QueueNotFoundError:
                    responder.notFoundResponse(res, 'queue not found');
                    return;
                default:
                    console.log(err);
                    responder.ohShitResponse(res, 'unknown error occurred');
            }
        });
    }

    /**
     * Get all nodes currently active in a queue
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getNodes(req, res) {
        req.getValidationResult().then(result => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then(results => {
            var queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            return connection.query(
                'SELECT * FROM Node WHERE queue_id = ? AND serviced_at IS NULL AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then(results => {
            responder.successResponse(res, results);
        }).catch(err => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case QueueNotFoundError:
                    responder.notFoundResponse(res, 'queue not found');
                    return;
                default:
                    console.log(err);
                    responder.ohShitResponse(res, 'unknown error occurred');
            }
        });
    }

    /**
     * Create a queue
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    createQueue(req, res) {
        const attributes = [req.body.name, req.body.capacity];

        req.getValidationResult().then(result => {
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return connection.query(
                'INSERT INTO queue(name, capacity, created_at) VALUES (?, ?, CURRENT_TIMESTAMP(3))',
                attributes
            );
        }).then(results => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ?',
                [results.insertId]
            );
        }).then(results => {
            responder.itemCreatedResponse(res, results[0], 'queue created');
        }).catch(err => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                default:
                    console.log(err); // TODO better error logging
                    responder.ohShitResponse(res, 'unknown error occurred');
                    return;
            }
        });
    }

    /**
     * Services first node in queue
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    service(req, res) {
        var node, queue;
        // validate params
        req.getValidationResult().then(result => {
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ?',
                [req.params.queueId]
            );
        }).then(results => {
            queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // get node to be serviced
            return connection.query(
                'SELECT * FROM Node n WHERE n.created_at = (SELECT min(created_at) FROM Node WHERE queue_id = ? AND serviced_at IS NULL AND deleted_at IS NULL)',
                [req.params.queueId]
            );
        }).then(results => {
            node = results[0];
            console.log(node);
            if (!node) {
                throw new QueueEmptyError();
            }
            // service the node
            return connection.query(
                'UPDATE Node SET serviced_at = CURRENT_TIMESTAMP WHERE id = ?',
                [node.id]
            );
        }).then(_ => {
            // get all nodes active on queue
            return connection.query(
                'SELECT * FROM Node WHERE queue_id = ? AND serviced_at IS NULL AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then(results => {
            queue.nodes = results;
            responder.itemUpdatedResponse(res, queue, 'queue serviced');
        }).catch(err => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case QueueNotFoundError:
                    responder.notFoundResponse(res, 'queue not found');
                    return;
                case QueueEmptyError:
                    responder.badRequestResponse(res, 'queue is empty');
                    return;
                default:
                    console.log(err); // TODO better error logging
                    responder.ohShitResponse(res, 'unknown error occurred');
                    return;
            }
        });
    }

    /**
     * Delete a queue
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    deleteQueue(req, res) {
        // check queue exists and is not deleted
        req.getValidationResult().then(result => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(_ => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
                [req.params.queueId]
            )
        }).then(results => {
            // check queue exists and is not deleted
            var queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // delete the queue
            return connection.query(
                'UPDATE Queue SET deleted_at = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [req.params.queueId]
            );
        }).then(_ => {
            // success!
            responder.itemDeletedResponse(res);
        }).catch(err => {
            switch (err.constructor) {
                case QueueNotFoundError:
                    responder.notFoundResponse(res, 'queue not found');
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

