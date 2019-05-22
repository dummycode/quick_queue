var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render(
        'index', 
        { 
            title: 'Quick Queue', 
            message: 'Hello there! This is probably not what you are looking for; the api can be found at <a href="/api">/api</a>' 
        }
    );
});

module.exports = router;
