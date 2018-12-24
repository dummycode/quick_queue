var Database = require('../core/database');
var connection = new Database();

var { 
    NodeNotFoundError, 
    NodePreviouslyServiced, 
    QueueNotFoundError,
    QueueAtCapacityError,
} = require('../core/errors');

exports.Manager = class Manager {
    /**
     * Create a node given a name and queue_id
     * 
     * @param {string} name 
     * @param {number} queue_id 
     */
    createNode(name, queue_id) {
        var queue; 

        return connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [queue_id]
        ).then(results => {
            queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // get all nodes active on queue
            return connection.query(
                'SELECT * FROM Queue LEFT JOIN Node ON Queue.id = Node.queue_id WHERE Node.serviced_at IS NULL AND Node.deleted_at IS NULL AND Queue.id = ?',
                [queue_id]
            );
        }).then(results => {
            if (queue.capacity && results.length >= queue.capacity) {
                throw new QueueAtCapacityError();
            }
            // create the node
            return connection.query(
                'INSERT INTO Node(name, queue_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP(3))',
                [name, queue_id]
            );
        }).then(results => {
            // get inserted node
            return connection.query(
                'SELECT * FROM Node WHERE id = ?',
                [results.insertId]
            );
        });
    }

    /**
     * Delete a node if it is not already deleted
     * 
     * @param {number} node_id 
     */
    deleteNode(node_id) {
        return connection.query(
            'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
            [node_id]
        ).then(results => {
            // check node exists and is not deleted
            var node = results[0];
            if (!node) {
                throw new NodeNotFoundError();
            } else if (node.serviced_at) {
                throw new NodePreviouslyServiced();
            }
            // delete the node
            return connection.query(
                'UPDATE Node SET deleted_at = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [node_id]
            );
        });
    }

    /**
     * Service a node if it is not already serviced or deleted
     * 
     * @param {number} node_id 
     */
    serviceNode(node_id) {
        return connection.query(
            'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
            [node_id]
        ).then(results => {
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
                [node_id]
            );
        }).then(_ => {
            return connection.query(
                'SELECT * FROM Node WHERE id = ?',
                [node_id]
            );
        });
    }
};