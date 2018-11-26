var express = require('express');
var router = express.Router();

var config = require('../../core/config');

var Responder = require('../../core/responder');
var responder = new Responder();

/* GET API index page. */
router.get('/', function(req, res) {
  var apiData = {
    "version" : config.get("api.version"),
  };

  responder.successResponse(res, apiData, 'Woo! The API works!');
});

module.exports = router;
