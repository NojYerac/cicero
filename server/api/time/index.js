'use strict';

var express = require('express');
var controller = require('./time.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/latest', auth.isAuthenticated(), controller.latest);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/:id/stop', auth.isAuthenticated(), controller.stop);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
