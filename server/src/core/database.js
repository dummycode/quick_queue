var mysql = require('mysql');
var config = require('./config');

class Database {
    constructor () {
        this.connection = mysql.createConnection({
            ...config.get('database')
        }, function (err) {
            if (err) {
                console.log('yikes, database is not operating');
            }
        });
    }

    query (sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    }
}

module.exports = Database;
