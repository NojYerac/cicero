'use strict';

var _ = require('lodash');
var Time = require('./time.model');

// Get list of times
exports.index = function(req, res) {
  Time.find(function (err, times) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(times);
  });
};

// Get a single time
exports.show = function(req, res) {
  Time.findById(req.params.id, function (err, time) {
    if(err) { return handleError(res, err); }
    if(!time) { return res.sendStatus(404); }
    return res.json(time);
  });
};

// Creates a new time in the DB.
exports.create = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  if (!(req.user && req.user._id)) {
    return handleError(res, new Error('User id missing'));
  }
  req.body.startTime = req.body.startTime || new Date();
  if (req.user.role !== 'admin') {
    req.body.userId = req.user._id;
    if (req.user.canSeeClients.indexOf(req.body.clientId)===-1) {
      return res.sendStatus(403);
    }
  }
  Time.create(req.body, function(err, time) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(time);
  });
};

// Updates an existing time in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Time.findById(req.params.id, function (err, time) {
    if (err) { return handleError(res, err); }
    if(!time) { return res.sendStatus(404); }
    var updated = _.merge(time, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(time);
    });
  });
};

// Deletes a time from the DB.
exports.destroy = function(req, res) {
  Time.findById(req.params.id, function (err, time) {
    if(err) { return handleError(res, err); }
    if(!time) { return res.sendStatus(404); }
    time.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
};

// Stop a running timer
exports.stop = function(req, res) {
  var search = req.params.id === 'active' ?
    { userId : req.user._id, endTime : new Date(0)} :
    { _id : req.params.id};
  //search.endTime = new Date(0);
  Time.findOne(search, function(err, time) {
    if (err) { return handleError(res, err); }
    if (!time) {return res.sendStatus(404); }
    //time.endTime = req.body.endTime
    Time.update({_id: time._id}, {endTime: req.body.endTime}, function(err){
      if (err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
};

// Get the latest time saved by this user.
exports.latest = function(req, res) {
  var search = { userId : req.user._id }
  Time.findOne(search, {}, {sort : {startTime: -1}},
    function(err, time) {
      if (err) return handleError(res, err);
      if (!time) return res.sendStatus(404);
      if (
        req.user.role !== "admin" &&
        req.user.canSeeClients.indexOf(time.clientId) === -1
      ) {
        res.json(403, {message: 'Unauthorized to view cilentId ' + time.clientId});
      }
      res.json(time);
    });
};

function handleError(res, err) {
  return res.status(500).json(err);
}
