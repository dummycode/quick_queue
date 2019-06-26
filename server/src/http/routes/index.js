var express = require('express');
var router = express.Router();

var Responder = require('../../core/responder');
var responder = new Responder();

/* GET home page. */
router.get('/', function (req, res, next) {
    responder.successResponse(res, {}, 'Hello there! This is probably not what you are looking for; the API can be found at /api');
});

module.exports = router;
