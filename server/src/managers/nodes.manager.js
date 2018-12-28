var Database = require('../core/database');
var connection = new Database();

var {
    NodeNotFoundError,
    NodePreviouslyServiced,
    QueueNotFoundError,
    QueueAtCapacityError,
    QueueNotActiveError
} = require('../core/errors');

exports.Manager = class Manager {
    /**
     * Create a node given a name and queue_id
     *
     * @param {string} name
     * @param {number} queueId
     */
    createNode (name, queueId) {
        var queue;

        return connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [queueId]
        ).then(results => {
            queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            } else if (!queue.active) {
                throw new QueueNotActiveError();
            }
            // get all nodes active on queue
            return connection.query(
                'SELECT * FROM Queue LEFT JOIN Node ON Queue.id = Node.queue_id WHERE Node.serviced_at IS NULL AND Node.deleted_at IS NULL AND Queue.id = ?',
                [queueId]
            );
        }).then(results => {
            if (queue.capacity && results.length >= queue.capacity) {
                throw new QueueAtCapacityError();
            }
            // create the node
            return connection.query(
                'INSERT INTO Node(name, queue_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP(3))',
                [name, queueId]
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
     * @param {number} nodeId
     */
    deleteNode (nodeId) {
        return connection.query(
            'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
            [nodeId]
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
                [nodeId]
            );
        });
    }

    /**
     * Service a node if it is not already serviced or deleted
     *
     * @param {number} nodeId
     */
    serviceNode (nodeId) {
        var node;
        return connection.query(
            'SELECT * FROM Node WHERE id = ? AND deleted_at IS NULL',
            [nodeId]
        ).then(results => {
            // check node exists and is not deleted
            node = results[0];
            if (!node) {
                throw new NodeNotFoundError();
            } else if (node.serviced_at) {
                throw new NodePreviouslyServiced();
            }

            return connection.query(
                'SELECT * FROM Queue WHERE id = ?',
                [node.queue_id]
            );

        }).then(results => {
            var queue = results[0];
            if (!queue.active) {
                throw new QueueNotActiveError();
            }

            // service the node
            return connection.query(
                'UPDATE Node SET serviced_at = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [nodeId]
            );
        }).then(_ => {
            return connection.query(
                'SELECT * FROM Node WHERE id = ?',
                [nodeId]
            );
        });
    }
};
