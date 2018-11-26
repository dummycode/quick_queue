var connection = require('../core/database');

var Responder = require('../core/responder');
var responder = new Responder();

var Validator = require('../core/validator');
var validator = new Validator();

module.exports = class Controller {

    /**
     * Get all nodes
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getAll(req, res) {
        // logic to get all nodes
        connection.query('SELECT * FROM Node WHERE deleted_at IS NULL', function (err, results, fields) {
            if (err) {
                // TODO error logging
                responder.ohShitResponse(res, 'error with query');
            } else {
                responder.successResponse(res, results);
            }
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
        
        // TODO validate param

        connection.query({
            sql : 'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL', 
            values : [req.params.nodeId],
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
                    responder.notFoundResponse(res, 'node not found');
                }
            }
        });
    }

    /**
     * Create a node
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    post(req, res) {
        console.log('new node');

        let attributes = [req.body.name, req.body.queue_id];

        if (!validator.validate(attributes, {})) { // TODO validate params
            // QUIT
            responder.badRequestResponse(res);
            return;
        }

        // TODO refactor this oogly ish (promises)
        connection.query({
            sql : "SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL",
            values : [req.body.queue_id],
        }, function (err, results, fields) {
            if (err) {
                // TODO error logging
                console.log(err);
                responder.ohShitResponse(res, 'error with query');
            } else {
                // queue does not exist
                var queue = results[0];
                if (!queue) {
                    responder.badRequestResponse(res, "queue not found");
                } else { 
                    // check capacity
                    connection.query({
                        sql : 'SELECT * FROM Queue LEFT JOIN Node ON Queue.id = Node.queue_id WHERE Node.serviced_at IS NULL AND Node.deleted_at IS NULL AND Queue.id = ?',
                        values : [queue.id],
                    }, function (err, results, fields) {
                        if (err) {
                            // TODO error logging
                            console.log(err);
                            responder.ohShitResponse(res, 'error with query');
                        } else {
                            // check capacity
                            if (queue.capacity && results.length >= queue.capacity) {
                                responder.badRequestResponse(res, "queue is at capacity");
                            } else {
                                // all checks complete, send it
                                connection.query({
                                    sql : 'INSERT INTO Node(name, queue_id) VALUES (?, ?)', 
                                    values : attributes,
                                }, function (err, results, fields) {
                                    if (err) {
                                        // TODO error logging
                                        console.log(err);
                                        responder.ohShitResponse(res, 'error with query');
                                    } else {
                                        // no error, node created
                                        connection.query({
                                            sql : 'SELECT * FROM Node WHERE id = ?',
                                            values : [results.insertId],
                                        }, function (err, results, fields) {
                                            if (err) {
                                                responder.ohShitResponse(res, "node created, but failed to get data");
                                            } else {
                                                responder.itemCreatedResponse(res, results[0], 'node created');
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    /**
     * Delete a node
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    delete(req, res) {
        console.log('delete node ', req.params);

        // TODO validate param

        // check node exists and is not deleted
        connection.query({
            sql : "SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL",
            values : [req.params.nodeId],
        }, function (err, results, fields) {
            if (err) {
                // TODO error logging
                console.log(err);
                responder.ohShitResponse(res, 'error with query');
            } else {
                // node does not exist, cannnot delete it
                if (!results[0]) {
                    responder.notFoundResponse(res, "node not found");
                } else {
                    // passed checks, delete it
                    connection.query({
                        sql : 'UPDATE Node SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', 
                        values : [req.params.nodeId],
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

    /**
     * @param {Request} req 
     * @param {Response} res 
     */
    service(req, res) {
        // TODO validate param

        // check node exists and is not deleted
        connection.query({
            sql : "SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL",
            values : [req.params.nodeId],
        }, function (err, results, fields) {
            if (err) {
                // TODO error logging
                console.log(err);
                responder.ohShitResponse(res, 'error with query');
            } else {
                // node does not exist, cannnot delete it
                var node = results[0];
                if (!node) {
                    responder.notFoundResponse(res, "node not found");
                } else if (node.serviced_at) {
                    responder.badRequestResponse(res, "node alread serviced");
                } else {
                    // passed checks, delete it
                    connection.query({
                        sql : 'UPDATE Node SET serviced_at = CURRENT_TIMESTAMP WHERE id = ?', 
                        values : [req.params.nodeId],
                    }, function (err, results, fields) {
                        if (err) {
                            // TODO error logging
                            console.log(err);
                            responder.ohShitResponse(res, 'error with query');
                        } else {
                            // no error, return success
                            responder.itemUpdatedResponse(res, {}, 'node serviced'); // TODO return data
                        }
                    });
                }
            }
        });
    }
};
