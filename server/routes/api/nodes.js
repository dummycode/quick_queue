'use strict';

var express = require('express');
var router = express.Router();

var Controller = require('../../controllers/nodes.controller');
var controller = new Controller();

/* GET nodes */
router.get('/', controller.getAll);

/* GET node */
router.get('/:nodeId', controller.getOne);

/* POST node */
router.post('/', controller.post);

/* DELETE node */
router.delete('/:nodeId', controller.delete);

/* POST service */
router.post('/:nodeId/service', controller.service);

module.exports = router;

