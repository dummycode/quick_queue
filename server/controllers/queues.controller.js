var util = require('util');

var Responder = require('../core/responder');
var responder = new Responder();

var Validator = require('../core/validator');
var validator = new Validator();

var Database = require('../core/database');
var connection = new Database();

module.exports = class Controller {

    /**
     * Get all queues
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getAll(req, res) {
        // logic to get all queues
        connection.query('SELECT * FROM Queue WHERE deleted_at IS NULL').then(results => {
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

        // TODO validate param

        var queue;

        connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL', [req.params.queueId]
        ).then(results => {
            queue = results[0];
            if (queue) {
                return connection.query(
                    'SELECT * FROM Node WHERE queue_id = ? AND serviced_at IS NULL AND deleted_at IS NULL',
                    [req.params.queueId]
                );
            } else {
                responder.notFoundResponse(res, "queue not found");
            }
        }).then(results => {
            queue.nodes = results;
            if (queue) {
                responder.successResponse(res, queue); // TODO change response format
            }
        }).catch(err => {
            console.log(err); // TODO error logging
            responder.ohShitResponse(res, 'error with query');
        });
    }

    /**
     * Create a queue
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    post(req, res) {
        let attributes = [req.body.name, req.body.capacity];

        if (!validator.validate(attributes, {})) { // TODO validate params
            // QUIT
            responder.badRequestResponse(res);
            return;
        }

        connection.query(
            'INSERT INTO Queue(name, capacity) VALUES (?, ?)',
            attributes
        ).then(results => {
            return connection.query('SELECT * FROM Queue WHERE id = ?', [results.insertId])
        }).then(results => {
            responder.itemCreatedResponse(res, results[0], 'queue created');
        }).catch(err => {
            console.log(err); // TODO error logging
            responder.ohShitResponse(res, 'error with query');
        })
    }

    /**
     * Delete a queue
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    async delete(req, res) {
        // TODO validate param

        // check queue exists and is not deleted
        var queue;

        connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [req.params.queueId]
        ).then(results => {
            queue = results[0];
            // if queue exists, delete it
            if (queue) {
                return connection.query(
                    'UPDATE Queue SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [req.params.queueId]
                );
            } else {
                responder.notFoundResponse(res, 'queue not found');
            }
        }).then(results => {
            if (queue) {
                responder.itemDeletedResponse(res);
            }
        }).catch(err => {
            // TODO error logging
            console.log(err);
            responder.ohShitResponse(res, 'error with query');
        });
    }
};

