var mysql = require('mysql');
var config = require('./config');

let connection = function() {
    var database = config.get("database");

    return mysql.createConnection({
        ...database
    }, function (err) {
        if (err) {
            console.log("database is not operating lol");
            return;
        }
    });
};

module.exports = connection();