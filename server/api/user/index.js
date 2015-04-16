'use strict';

var express = require('express');
var controller = require('./user.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.validateCSRFToken('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/csrf', auth.isAuthenticated(), controller.csrf);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.patch('/:id/role', auth.hasRole('admin'), controller.role);

module.exports = router;
