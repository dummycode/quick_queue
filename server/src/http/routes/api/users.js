'use strict';

var express = require('express');
var router = express.Router();

var { Controller, validate} = require('../../controllers/users.controller');
var controller = new Controller();

var { validate } = require('../../controllers/validators/users.validator');

/* POST register */
router.post('/register', validate('register'), controller.register);

module.exports = router;
