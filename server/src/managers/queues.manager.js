var Database = require('../core/database');
var connection = new Database();

var { 
    QueueNotFoundError,
    QueueEmptyError,
} = require('../core/errors');

exports.Manager = class Manager {
    /**
     * Create a queue
     * 
     * @param {string} name 
     */
    createQueue(name, capacity) {
        return connection.query(
            'INSERT INTO queue(name, capacity, created_at) VALUES (?, ?, CURRENT_TIMESTAMP(3))',
            [name, capacity]
        ).then(results => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ?',
                [results.insertId]
            );
        });
    }
    
    /**
     * Delete a queue if not already deleted
     * 
     * @param {number} queue_id
     */
    deleteQueue(queue_id) {
        return connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [queue_id]
        ).then(results => {
            // check queue exists and is not deleted
            var queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // delete the queue
            return connection.query(
                'UPDATE Queue SET deleted_at = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [queue_id]
            );
        });
    }

    /**
     * Activate a queue
     * 
     * @param {number} queue_id
     */
    activateQueue(queue_id) {
        return connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [queue_id]
        ).then(results => {
            // check queue exists and is not deleted
            var queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // activate the queue
            return connection.query(
                'UPDATE Queue SET active = 1 WHERE id = ?',
                [queue_id]
            );
        }).then(_ => {
            return connection.query('SELECT * FROM Queue WHERE id = ?', [queue_id]);
        });
    }

    /**
     * Activate a queue
     * 
     * @param {number} queue_id
     */
    deactivateQueue(queue_id) {
        return connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [queue_id]
        ).then(results => {
            // check queue exists and is not deleted
            var queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // activate the queue
            return connection.query(
                'UPDATE Queue SET active = 0 WHERE id = ?',
                [queue_id]
            );
        }).then(_ => {
            return connection.query('SELECT * FROM Queue WHERE id = ?', [queue_id]);
        });
    }
};