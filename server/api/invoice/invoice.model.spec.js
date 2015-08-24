'use strict';

// Libs
var async = require('async'),
  _ = require('lodash'),
  should = require('should');

// Application
var app = require('../../app');

// models
var Invoice = require('./invoice.model'),
  User = require('../user/user.model'),
  Client = require('../client/client.model'),
  Project = require('../project/project.model'),
  Time = require('../time/time.model');

// globals
var client,
  user,
  projects = [],
  times = [];

function clearDb(callback) {
  async.parallel([
    function(cb) {
      Invoice.find({}).remove(cb);
    },
    function(cb) {
      Client.find({}).remove(cb);
    },
    function(cb) {
      User.find({}).remove(cb);
    },
    function(cb) {
      Project.find({}).remove(cb);
    },
    function(cb) {
      Time.find({}).remove(cb);
    },
  ], callback);
}

function saveClient(cb) {
  client = new Client({
    name: 'Test Client',
    prefix: 'TEST',
    defaultRate: 50,
    contact: [],
    active: true
  });
  client.save(cb);
}

function saveUser(cb) {
  user = new User({
    provider: 'local',
    name: 'Fake User',
    email: 'test@test.com',
    password: 'password',
    canSeeClients: [client._id]
  });
  user.save(cb);
}

function saveProjects(callback) {
  async.parallel(_.times(3, function(n) {
    return function(cb) {
      var project = new Project({
        name: 'Test Project ' + n,
        note: 'TEST ' + n,
        rate: 50,
        clientId: client._id
      });
      projects.push(project);
      project.save(cb);
    }
  }), callback);
}

function saveTimes(callback) {
  async.parallel(_.times(3, function(p) {
    return function(callback1) {
      async.parallel(_.times(3, function(t) {
        return function(cb) {
          var start = Date.now() + (((p * 3) + t) * 60 * 60 * 1000);
          var end = start + (33 * 60 * 1000);
          var time = new Time({
            userId: user._id,
            startTime: new Date(start),
            endTime: new Date(end),
            clientId: client._id,
            projectId: projects[p]._id,
          });
          times.push(time);
          time.save(cb);
        }
      }), callback1);
    };
  }), callback);
}

function seedDb(callback) {
  async.series([
    saveClient,
    saveUser,
    saveProjects,
    saveTimes,
  ], callback);
}

describe('Invoice Model', function() {

  before(function(done) {
    // Clear and seed database before testing
    async.series([
      clearDb,
      seedDb
    ], done);
  });

  after(function(done) {
    // Clear the database after testing
    clearDb(done);
  });

  it('should begin with one users', function(done) {
    User.find({}, function(err, users) {
      users.should.have.length(1);
      done();
    });
  });

  it('should save an invoice', function(done) {
    var issueDate = new Date();
    var dueDate = (new Date()).setMonth(issueDate.getMonth() + 1);
    var invoice = new Invoice({
      title: 'Test Invoice',
      clientId: client._id,
      issueDate: issueDate,
      dueDate: dueDate
    });

    invoice.setTimesAsync(_.map(times, '_id'))
      .catch(function(error) {
        done(error);
      }).then(function(invDoc) {
        invDoc.save(function(error, invoiceDoc) {
          if (error) return done(error);
          invoiceDoc.should.have.property('title', 'Test Invoice');
          invoiceDoc.should.have.property('times')
            .which.has.length(9);
          invoiceDoc.should.have.property('timeLineItems')
            .which.has.length(3);
          invoiceDoc.timeLineItems.forEach(function(lineItem) {
            lineItem.should.have.property('times')
              .which.has.length(3);
            lineItem.should.have.property('name')
              .which.match(/Test Project \d/);
            lineItem.should.have.property('note')
              .which.match(/TEST \d/);
            lineItem.should.have.property('units')
              .which.equal('Hour');
            lineItem.should.have.property('rate')
              .which.equal(50);
            lineItem.should.have.property('quantity')
              .which.equal(1.75);
          });
          done();
        });
      });
  });



});
