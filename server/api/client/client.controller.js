'use strict';

var _ = require('lodash');
var Client = require('./client.model');

// Get list of clients
exports.index = function(req, res) {
  Client.find(function (err, clients) {
    if(err) { return handleError(res, err); }
    return res.json(200, clients);
  });
};

// Get a single client
exports.show = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    return res.json(client);
  });
};

// Creates a new client in the DB.
exports.create = function(req, res) {
  Client.create(req.body, function(err, client) {
    if(err) { return handleError(res, err); }
    return res.json(201, client);
  });
};

// Updates an existing client in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Client.update({_id :req.params.id}, req.body, function (err, client) {
    if (err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    return res.json(204);
    // console.log('***********\nbody\n\n' + JSON.stringify(req.body) + '\n\n');
    // console.log('***********\nbefore merge\n\n' + client + '\n\n');
    // _.merge(client, req.body);
    // console.log('***********\nafter merge\n\n' + client + '\n\n');
    // client.save(function (err, c) {
    //   if (err) { return handleError(res, err); }
    //   console.log('***********\nafter save\n\n' + c + '\n\n');
    //   return res.json(200, c);
    // });
  });
};

// Deletes a client from the DB.
exports.destroy = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    client.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
