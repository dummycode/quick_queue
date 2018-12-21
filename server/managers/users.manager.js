var Database = require('../core/database');
var connection = new Database();

var bcrypt = require('bcryptjs');

var {
    UserAlreadyExistsError,
    EncryptionFailedError,
} = require('../core/errors');

exports.Manager = class Manager {
    /**
     * Create a user given a username and password
     * 
     * @param {string} username
     * @param {string} password
     */
    createUser(username, password) {
        bcrypt.hash(password, 8, function(err, hash) {
            if (err) {
                throw new EncryptionFailedError();
            }
            password = hash;
        });

        return connection.query(
            'SELECT * FROM User WHERE username = ? AND deleted_at IS NULL',
            [username]
        ).then(results => {
            var user = results[0];
            if (user) {
                throw new UserAlreadyExistsError();
            }
            // create the user
            return connection.query(
                'INSERT INTO User(username, password, created_at) VALUES (?, ?, CURRENT_TIMESTAMP(3))',
                [username, password]
            );
        }).then(results => {
            // get created user
            return connection.query(
                'SELECT * FROM User WHERE id = ?',
                [results.insertId]
            );
        });
    }
};
