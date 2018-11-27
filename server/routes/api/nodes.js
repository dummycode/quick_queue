'use strict';

var express = require('express');
var router = express.Router();

var { Controller} = require('../../controllers/nodes.controller');
var controller = new Controller();
var { validate } = require('../../controllers/validators/nodes.validator');

/* GET nodes */
router.get('/', controller.getAll);

/* GET node */
router.get('/:nodeId', validate('getOne'), controller.getOne);

/* POST node */
router.post('/', validate('createNode'), controller.createNode);

/* DELETE node */
router.delete('/:nodeId', validate('deleteNode'), controller.deleteNode);

/* POST service */
router.post('/:nodeId/service', validate('service'), controller.service);

module.exports = router;

