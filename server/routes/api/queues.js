'use strict';

var express = require('express');
var router = express.Router();

var Controller = require('../../controllers/queues.controller');
var controller = new Controller();

/* GET queues */
router.get('/', controller.getAll);

/* GET queue */
router.get('/:queueId', controller.getOne);

/* POST queue */
router.post('/', controller.post);

/* DELETE queue */
router.delete('/:queueId', controller.delete);

module.exports = router;

