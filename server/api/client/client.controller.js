'use strict';

var _ = require('lodash');
var Client = require('./client.model');
var validate = require('../validate');

// Get list of clients
exports.index = function(req, res) {
  Client.find(function (err, clients) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(clients);
  });
};

// Get a single client
exports.show = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.sendStatus(404); }
    return res.json(client);
  });
};

// Creates a new client in the DB.
exports.create = function(req, res) {
  Client.create(req.body, function(err, client) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(client);
  });
};

// Updates an existing client in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  var vError = validate.update( req.body, [
    {name:'name',type:String,required:true},
    {name: 'prefix', type:String, required:true},
    {name: 'defaultRate', type: Number, required:true},
    {name: 'active', type: Boolean, required: true}]);
  if (vError) {
    return res.status(500).json(vError);
  }
  Client.update({_id :req.params.id}, req.body, function (err, client) {
    if (err) { return handleError(res, err); }
    if(!client) { return res.sendStatus(404); }
    return res.sendStatus(204);
  });
};

// Deletes a client from the DB.
exports.destroy = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.sendStatus(404); }
    client.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
