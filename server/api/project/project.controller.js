'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var Client = require('../client/client.model');


// Get list of projects
exports.index = function(req, res) {
  var query = req.query;
  if (req.user.role !== 'admin') {
    if (query.clientId) {
      var clientIds = clientId.split(',');
      for (clientId in clientIds) {
        if (req.user.canSeeClients.indexOf(clientId) === -1) {
          return res.json(403, {});
        }
      }
    }
  }
  Project.find(query, function (err, projects) {
    if(err) { return handleError(res, err); }
    return res.json(200, projects);
  });
};

// Get a single project
exports.show = function(req, res) {
  Project.findById(req.params.id, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    return res.json(project);
  });
};

// Creates a new project in the DB.
exports.create = function(req, res) {
  Project.create(req.body, function(err, project) {
    if(err) { return handleError(res, err); }
    return res.json(201, project);
  });
};

// Updates an existing project in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  console.log(req.body);
  if (!req.body.name) return handleError(res, new Error('Name cannot be blank!'));
  Client.findById(req.body.clientId, function(err, client) {
    if (err) { return handleError(res, err); };
    if (client) {
      console.log(client);
      Project.update({_id :req.params.id}, req.body, function (err, project) {
        if (err) { return handleError(res, err); }
        if(!project) { return res.send(404); }
        return res.json(204);
      });
    } else {
      handleError(res, new Error('Client not found!'));
    }
  });


};

// Deletes a project from the DB.
exports.destroy = function(req, res) {
  Project.findById(req.params.id, function (err, project) {
    if(err) { return handleError(res, err); }
    if(!project) { return res.send(404); }
    project.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
