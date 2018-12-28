var express = require('express');
var router = express.Router();

var config = require('../../../core/config');

var Responder = require('../../../core/responder');
var responder = new Responder();

var { Controller } = require('../../controllers/users.controller');
var userController = new Controller();

var { validate } = require('../../controllers/validators/users.validator');

var { isAuthenticated } = require('../../controllers/middleware/auth.middleware.js');

/* GET API index page. */
router.get('/', function (req, res) {
    var apiData = {
        'version': config.get('api.version')
    };

    responder.successResponse(res, apiData, 'Woo! The API works!');
});

/* GET user */
router.get('/whoami', isAuthenticated, userController.whoami);

/* POST login */
router.post('/login', validate('login'), userController.login);

module.exports = router;
