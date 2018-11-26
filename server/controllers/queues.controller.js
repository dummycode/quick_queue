var connection = require('../core/database');

var Responder = require('../core/responder');
var responder = new Responder();

var Validator = require('../core/validator');
var validator = new Validator();


module.exports = class Controller {

    /**
     * Get all queues
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getAll(req, res) {
        // logic to get all queues
        connection.query('SELECT * FROM Queue WHERE deleted_at IS NULL', function (err, results, fields) {
            if (err) {
                // TODO error logging
                console.log(err);
                responder.ohShitResponse(res, 'error with query');
            } else {
                responder.successResponse(res, results);
            }
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

        connection.query({
            sql : 'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL', 
            values : [req.params.queueId],
        }, function (err, results, fields) {
            if (err) {
                // TODO error logging
                console.log(err);
                responder.ohShitResponse(res, 'error with query');
            } else {
                // no error, proceed with results, or lack thereof
                console.log(results);
                if (results[0]) { // TODO fix check for exists
                    responder.successResponse(res, results[0]); // TODO change response format
                } else {
                    responder.notFoundResponse(res, 'queue not found');
                }
            }
        });
    }

    /**
     * Create a queue
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    post(req, res) {
        console.log('new queue');

        let attributes = [req.body.name, req.body.capacity];

        if (!validator.validate(attributes, {})) { // TODO validate params
            // QUIT
            responder.badRequestResponse(res);
            return;
        }

        connection.query({
            sql : 'INSERT INTO Queue(name, capacity) VALUES (?, ?)', 
            values : attributes,
        }, function (err, results, fields) {
            if (err) {
                // TODO error logging
                console.log(err);
                responder.ohShitResponse(res, 'error with query');
            } else {
                // no error, queue created
                connection.query({
                    sql : 'SELECT * FROM Queue WHERE id = ?',
                    values : [results.insertId],
                }, function (err, results, fields) {
                    if (err) {
                        responder.ohShitResponse(res, "queue created, but failed to get data");
                    } else {
                        responder.itemCreatedResponse(res, results[0], 'queue created');
                    }
                });
            }
        });
    }

    /**
     * Delete a queue
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    delete(req, res) {
        // TODO validate param

        // check queue exists and is not deleted
        connection.query({
            sql : "SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL",
            values : [req.params.queueId],
        }, function (err, results, fields) {
            if (err) {
                // TODO error logging
                console.log(err);
                responder.ohShitResponse(res, 'error with query');
            } else {
                // queue does not exist, cannnot delete it
                if (!results[0]) {
                    responder.notFoundResponse(res, "queue not found");
                } else {
                    // passed checks, delete it
                    connection.query({
                        sql : 'UPDATE Queue SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', 
                        values : [req.params.queueId],
                    }, function (err, results, fields) {
                        if (err) {
                            // TODO error logging
                            console.log(err);
                            responder.ohShitResponse(res, 'error with query');
                        } else {
                            // no error, return success
                            responder.itemDeletedResponse(res);
                        }
                    });
                }
            }
        });
    }
};

