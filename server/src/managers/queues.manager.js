var Database = require('../core/database');
var connection = new Database();

var {
    QueueNotFoundError
} = require('../core/errors');

exports.Manager = class Manager {
    /**
     * Create a queue
     *
     * @param {string} name
     */
    createQueue (name, capacity) {
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
     * @param {number} queueId
     */
    deleteQueue (queueId) {
        return connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [queueId]
        ).then(results => {
            // check queue exists and is not deleted
            var queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // delete the queue
            return connection.query(
                'UPDATE Queue SET deleted_at = CURRENT_TIMESTAMP(3) WHERE id = ?',
                [queueId]
            );
        });
    }

    /**
     * Activate a queue
     *
     * @param {number} queueId
     */
    activateQueue (queueId) {
        return connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [queueId]
        ).then(results => {
            // check queue exists and is not deleted
            var queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // activate the queue
            return connection.query(
                'UPDATE Queue SET active = 1 WHERE id = ?',
                [queueId]
            );
        }).then(_ => {
            return connection.query('SELECT * FROM Queue WHERE id = ?', [queueId]);
        });
    }

    /**
     * Activate a queue
     *
     * @param {number} queueId
     */
    deactivateQueue (queueId) {
        return connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [queueId]
        ).then(results => {
            // check queue exists and is not deleted
            var queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }
            // activate the queue
            return connection.query(
                'UPDATE Queue SET active = 0 WHERE id = ?',
                [queueId]
            );
        }).then(_ => {
            return connection.query('SELECT * FROM Queue WHERE id = ?', [queueId]);
        });
    }

    /**
     * Clear a given queue
     *
     * @param {number} queueId
     */
    clearQueue (queueId) {
        return connection.query(
            'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
            [queueId]
        ).then(results => {
            var queue = results[0];
            if (!queue) {
                throw new QueueNotFoundError();
            }

            return connection.query(
                'UPDATE Node SET deleted_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND deleted_at IS NULL AND serviced_at IS NULL',
                [queueId]
            );
        }).then(_ => {
            return connection.query(
                'SELECT * FROM Queue WHERE id = ? AND deleted_at IS NULL',
                [queueId]
            );
        });
    }
};