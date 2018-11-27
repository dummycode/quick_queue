var Responder = require('../core/responder');
var responder = new Responder();

var Validator = require('../core/validator');
var validator = new Validator();

var Database = require('../core/database');
var connection = new Database();

module.exports = class Controller {

    /**
     * Get all nodes
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    getAll(req, res) {
        // logic to get all nodes
        connection.query('SELECT * FROM Node WHERE deleted_at IS NULL').then(results => {
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
        
        // TODO validate param

        connection.query(
            'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
            [req.params.nodeId]
        ).then(results => {
            var node = results[0];
            if (node) {
                responder.successResponse(res, node);
            } else {
                responder.notFoundResponse(res, 'node not found');
            }
        }).catch(err => {
            console.log(err);
            responder.ohShitResponse(res, 'error with query');
        })
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

        var queue, node_inserted, node_selected;

        connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [req.body.queue_id]
        ).then(results => {
            queue = results[0];
            if (queue) {
                return connection.query(
                    'SELECT * FROM Queue LEFT JOIN Node ON Queue.id = Node.queue_id WHERE Node.serviced_at IS NULL AND Node.deleted_at IS NULL AND Queue.id = ?',
                    [req.body.queue_id]
                );
            } else {
                responder.badRequestResponse(res, 'queue not found');
            }
        }).then(results => {
            if (queue) {
                console.log(queue.capacity, results.length);
                if (!queue.capacity || results.length < queue.capacity) {
                    node_inserted = true;
                    return connection.query(
                        'INSERT INTO Node(name, queue_id) VALUES (?, ?)',
                        attributes
                    );
                } else {
                    responder.badRequestResponse(res, 'queue is at capacity');
                }
            }
        }).then(results => {
            console.log(results);
            if (node_inserted) {
                node_selected = true;
                return connection.query(
                    'SELECT * FROM Node WHERE id = ?',
                    [results.insertId]
                );
            }
        }).then(results => {
            if (node_selected) {
                responder.itemCreatedResponse(res, results[0], 'node created');
            }
        }).catch(err => {
            console.log(err);
            responder.ohShitResponse(res, 'error with query');
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

        var node;
        // check node exists and is not deleted
        connection.query(
            'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
            [req.params.nodeId]
        ).then(results => {
            node = results[0];
            if (node) {
                return connection.query(
                    'UPDATE Node SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [req.params.nodeId]
                );
            } else {
                responder.notFoundResponse(res, 'node not found');
            }
        }).then(_ => {
            if (node) {
                responder.itemDeletedResponse(res);
            }
        }).catch(err => {
            // TODO error logging
            console.log(err);
            responder.ohShitResponse(res, 'error with query');
        });
    }

    /**
     * Service a node if it is not already serviced or deleted
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    service(req, res) {
        // TODO validate param

        var node, node_serviced;

        // check node exists and is not deleted
        connection.query(
            'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
            [req.params.nodeId]
        ).then(results => {
            node = results[0];
            if (node) {
                // if node is serviced, return bad response
                if (node.serviced_at) {
                    responder.badRequestResponse(res, 'node already serviced');
                } else {
                    node_serviced = true
                    // service the node
                    return connection.query(
                        'UPDATE Node SET serviced_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [req.params.nodeId]
                    );
                }
            } else {
                responder.notFoundResponse(res, 'node not found');
            }
        }).then(results => {
            if (node_serviced) {
                // get node for item updated response
                return connection.query(
                    'SELECT * FROM Node WHERE id = ?',
                    [results.insertId]
                );
            }
        }).then(results => {
            if (node_serviced) {
                responder.itemUpdatedResponse(res, results[0], 'node serviced');
            }
        }).catch(err => {
            // TODO error logging
            console.log(err);
            responder.ohShitResponse(res, 'error with query');
        });
    }
};
