'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var Client = require('../client/client.model');


// Get list of projects
exports.index = function(req, res) {
  var clientIds = [],
    query = req.query;
  if (req.user.role === 'admin') {
    if (query.clientId) {
      clientIds = query.clientId.split(',');
    }
  } else {
    if (query.clientId) {
      query.clientId.split(',').forEach(
        function(clientId, i) {
          if (req.user.canSeeClients.indexOf(clientId) > -1) {
            clientIds.push(clientId);
          } else {
            res.unauthorized = true;
          }
        });
      if (res.unauthorized) return res.status(403).json({
        message: 'Unauthorized to view clientId'
      });
    } else {
      clientIds = req.user.canSeeClients
    }
  }
  var queryParams;
  switch (clientIds.length) {
    case 0:
      queryParams = {};
      break;
    case 1:
      queryParams = {
        clientId: clientIds[0]
      };
      break;
    default:
      queryParams = {
        clientId: {
          $in: clientIds
        }
      };
  }
  Project.find(
    queryParams,
    function(err, projects) {
      if (err) return handleError(res, err);
      if (!projects) return res.sendStatus(404);
      res.status(200).json(projects);
    });
};

// Get a single project
exports.show = function(req, res) {
  Project.findById(req.params.id, function(err, project) {
    if (err) {
      return handleError(res, err);
    }
    if (!project) {
      return res.sendStatus(404);
    }
    return res.json(project);
  });
};

// Creates a new project in the DB.
exports.create = function(req, res) {
  Project.create(req.body, function(err, project) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(201).json(project);
  });
};

// Updates an existing project in the DB.
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  if (!req.body.name) return handleError(res, new Error('Name cannot be blank!'));
  Client.findById(req.body.clientId, function(err, client) {
    if (err) {
      return handleError(res, err);
    }
    if (client) {
      Project.update({
        _id: req.params.id
      }, req.body, function(err, project) {
        if (err) {
          return handleError(res, err);
        }
        if (!project) {
          return res.sendStatus(404);
        }
        return res.sendStatus(204);
      });
    } else {
      handleError(res, new Error('Client not found!'));
    }
  });


};

// Deletes a project from the DB.
exports.destroy = function(req, res) {
  Project.findById(req.params.id, function(err, project) {
    if (err) {
      return handleError(res, err);
    }
    if (!project) {
      return res.sendStatus(404);
    }
    project.remove(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.sendStatus(204);
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
