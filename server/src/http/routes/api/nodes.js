'use strict';

var express = require('express');
var router = express.Router();

var { Controller } = require('../../controllers/nodes.controller');
var controller = new Controller();
var { validate } = require('../../controllers/validators/nodes.validator');

var {
    isAuthenticated,
    isAdministrator
} = require('../../controllers/middleware/auth.middleware');

/* GET nodes */
router.get('/', controller.getAll);

/* GET node */
router.get('/:nodeId', validate('getOne'), controller.getOne);

/* POST node */
router.post('/',
    [validate('createNode'), isAuthenticated],
    controller.createNode
);

/* DELETE node */
router.delete(
    '/:nodeId',
    [validate('deleteNode'), isAuthenticated, isAdministrator],
    controller.deleteNode
);

/* POST service */
router.post(
    '/:nodeId/service',
    [validate('service'), isAuthenticated, isAdministrator],
    controller.service
);

module.exports = router;
