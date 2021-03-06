const Responder = require('../../core/responder');
const responder = new Responder();

const Database = require('../../core/database');
const connection = new Database();

const { Manager } = require('../../managers/queues.manager');
const manager = new Manager();

var { reduceValidationError } = require('../../core/helpers');

const {
    ValidationFailedError,
    QueueNotFoundError,
    QueueEmptyError,
    QueueNotActiveError
} = require('../../core/errors');

exports.Controller = class Controller {
    /**
     * Get all queues
     *
     * @param {Request} req
     * @param {Response} res
     */
    getAll (req, res) {
        // logic to get all queues
        connection.query(
            'SELECT * FROM Queue WHERE deleted_at IS NULL'
        ).then((results) => {
            responder.successResponse(res, results);
        }).catch((err) => {
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
    getOne (req, res) {
        // logic to get one queue
        let queue;

        req.getValidationResult().then((result) => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(() => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then((results) => {
            queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            return connection.query(
                'SELECT * FROM Node WHERE queue_id = ? AND' +
                ' serviced_at IS NULL AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then((results) => {
            queue.nodes = results;
            responder.successResponse(res, queue);
        }).catch((err) => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case QueueNotFoundError:
                    responder.notFoundResponse(res, 'queue not found');
                    return;
                default:
                    console.log(err); // TODO better error logging
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
    getNodes (req, res) {
        req.getValidationResult().then((result) => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(() => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then((results) => {
            const queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            return connection.query(
                'SELECT * FROM Node WHERE queue_id = ? AND serviced_at IS NULL AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then((results) => {
            responder.successResponse(res, results);
        }).catch((err) => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                case QueueNotFoundError:
                    responder.notFoundResponse(res, 'queue not found');
                    return;
                default:
                    console.log(err); // TODO better error logging
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
    createQueue (req, res) {
        req.getValidationResult().then((result) => {
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(() => {
            return manager.createQueue(req.body.name, req.body.capacity);
        }).then((results) => {
            responder.itemCreatedResponse(res, results[0], 'queue created');
        }).catch((err) => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(res, 'invalid parameters');
                    return;
                default:
                    console.log(err); // TODO better error logging
                    responder.ohShitResponse(res, 'unknown error occurred');
            }
        });
    }

    /**
     * Services first node in queue
     *
     * @param {Request} req
     * @param {Response} res
     */
    service (req, res) {
        let node;
        let queue;
        // validate params
        req.getValidationResult().then((result) => {
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(() => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ?',
                [req.params.queueId]
            );
        }).then((results) => {
            queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            } else if (!queue.active) {
                throw new QueueNotActiveError();
            }
            // get node to be serviced
            return connection.query(
                'SELECT * FROM Node n WHERE n.created_at =' +
                ' (SELECT min(created_at) FROM Node WHERE' +
                ' queue_id = ? AND serviced_at IS NULL' +
                ' AND deleted_at IS NULL)',
                [req.params.queueId]
            );
        }).then((results) => {
            node = results[0];
            if (!node) {
                throw new QueueEmptyError();
            }
            // service the node
            return connection.query(
                'UPDATE Node SET serviced_at = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [node.id]
            );
        }).then(() => {
            // get all nodes active on queue
            return connection.query(
                'SELECT * FROM Node WHERE queue_id = ? AND serviced_at IS NULL AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then((results) => {
            queue.nodes = results;
            responder.itemUpdatedResponse(res, queue, 'queue serviced');
        }).catch((err) => {
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
                case QueueNotActiveError:
                    responder.badRequestResponse(res, 'queue is not active');
                    return;
                default:
                    console.log(err); // TODO better error logging
                    responder.ohShitResponse(res, 'unknown error occurred');
            }
        });
    }

    /**
     * Delete a queue
     *
     * @param {Request} req
     * @param {Response} res
     */
    deleteQueue (req, res) {
        // check queue exists and is not deleted
        req.getValidationResult().then((result) => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(() => {
            return manager.deleteQueue(req.params.queueId);
        }).then(() => {
            // success!
            responder.itemDeletedResponse(res);
        }).catch((err) => {
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
            }
        });
    }

    /**
     * Activate a queue
     *
     * @param {Request} req
     * @param {Response} res
     */
    activateQueue (req, res) {
        req.getValidationResult().then((result) => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
        }).then(() => {
            return manager.activateQueue(req.params.queueId);
        }).then((results) => {
            console.log(results);
            const queue = results[0];
            if (!queue) {
                throw new Error();
            }
            // success!
            responder.itemUpdatedResponse(res, queue);
        }).catch((err) => {
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
            }
        });
    }

    /**
     * Deactivate a queue
     *
     * @param {Request} req
     * @param {Response} res
     */
    deactivateQueue (req, res) {
        req.getValidationResult().then((result) => {
            // validate params
            if (!result.isEmpty()) {
                throw new ValidationFailedError();
            }
            return manager.deactivateQueue(req.params.queueId);
        }).then((results) => {
            const queue = results[0];
            if (!queue) {
                throw new Error();
            }
            // success!
            responder.itemUpdatedResponse(res, queue);
        }).catch((err) => {
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
            }
        });
    }

    /**
     * Clear a queue
     *
     * @param {Request} req
     * @param {Response} res
     */
    clear (req, res) {
        let queue;
        req.getValidationResult().then((result) => {
            if (!result.isEmpty()) {
                throw new ValidationFailedError(
                    result.array().map(reduceValidationError)
                );
            }
            return manager.clearQueue(req.params.queueId);
        }).then((results) => {
            queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            return connection.query(
                'SELECT * FROM Node WHERE queue_id = ? AND' +
                ' serviced_at IS NULL AND deleted_at IS NULL',
                [req.params.queueId]
            );
        }).then((results) => {
            queue.nodes = results;
            return responder.itemUpdatedResponse(res, queue, 'queue cleared');
        }).catch((err) => {
            switch (err.constructor) {
                case ValidationFailedError:
                    responder.badRequestResponse(
                        res,
                        'invalid parameters',
                        err.errors
                    );
                    return;
                default:
                    console.log(err);
                    responder.ohShitResponse(res, 'unknown error occurred');
            }
        });
    }
};
