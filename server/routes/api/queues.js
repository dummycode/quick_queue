'use strict';

var express = require('express');
var router = express.Router();

var { Controller, validate} = require('../../controllers/queues.controller');
var controller = new Controller();
var { validate } = require('../../controllers/validators/queues.validator');

/* GET queues */
router.get('/', controller.getAll);

/* GET queue */
router.get('/:queueId', validate('getOne'), controller.getOne);

/* GET queue nodes */
router.get('/:queueId/nodes', validate('getOne'), controller.getNodes);

/* POST queue */
router.post('/', validate('createQueue'), controller.createQueue);

/* POST service */
router.post('/:queueId/service', validate('getOne'), controller.service);

/* DELETE queue */
router.delete('/:queueId', validate('deleteQueue'), controller.deleteQueue);

module.exports = router;

