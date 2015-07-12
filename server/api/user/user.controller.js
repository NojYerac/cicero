'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword -csrfTokens', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = newUser.role || 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    // var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    // res.json({ token: token });
    var u = {
      _id : user._id,
      name : user.name,
      email : user.email,
      role : user.role
    }
    res.json(u);
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id || req.user._id;
  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send();
    res.json(user.profile);
  });
};

exports.update = function (req, res, next) {
  if (req.body._id) { delete req.body._id; }
  var userId;
  if (req.user.role==='admin' && req.params.id) {
    userId = req.params.id;
  } else {
    userId = req.user._id;
  }
  User.update({_id:userId}, req.body, function(err, user) {
    if (err) return res.status(500).json(err);
    if (!user) return res.status(404).json();
    return res.status(204).json();
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send();
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send();
      });
    } else {
      res.status(403).send();
    }
  });
};

/**
 * Change a users role
 * restrictions: 'admin'
 */
exports.role = function(req, res, next) {
  var userId = req.params._id;

  User.findOne({
    id: userId
  }, '-salt -hashedPassword -csrfTokens', function(err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).json();
    user.role = req.body.role;
    user.save(function(err){
      if(err) return validationError(res, err);
      res.json(user);
    });
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword -csrfTokens', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).json();
    res.json(user);
  });
};

exports.csrf = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).json();
    var  csrfToken = user.csrf;
    user.save(function(err) {
      if (err) return validationError(res, err);
      res.json({"csrfToken": csrfToken});
    });

  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
