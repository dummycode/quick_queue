'use strict';

var express = require('express');
var router = express.Router();

var { Controller } = require('../../controllers/queues.controller');
var controller = new Controller();

var { validate } = require('../../controllers/validators/queues.validator');

var {
    isAuthenticated,
    isAdministrator
} = require('../../controllers/middleware/auth.middleware');

/* GET queues */
router.get('/', controller.getAll);

/* GET queue */
router.get('/:queueId', validate('getOne'), controller.getOne);

/* GET queue nodes */
router.get('/:queueId/nodes', validate('getOne'), controller.getNodes);

/* POST queue */
router.post(
    '/',
    [validate('createQueue'), isAuthenticated, isAdministrator],
    controller.createQueue
);

/* POST service */
router.post(
    '/:queueId/service',
    [validate('getOne'), isAuthenticated, isAdministrator],
    controller.service
);

/* DELETE queue */
router.delete(
    '/:queueId',
    [validate('deleteQueue'), isAuthenticated, isAdministrator],
    controller.deleteQueue
);

/* POST queue */
router.post(
    '/:queueId/activate',
    [validate('activateQueue'), isAuthenticated, isAdministrator],
    controller.activateQueue
);

/* POST queue */
router.post(
    '/:queueId/deactivate',
    [validate('deactivateQueue'), isAuthenticated, isAdministrator],
    controller.deactivateQueue);

/* POST queue */
router.post(
    '/:queueId/clear',
    [validate('clear'), isAuthenticated, isAdministrator],
    controller.clear
);

module.exports = router;
