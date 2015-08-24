'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var async = require('async');
var User = require('../user/user.model');
var Client = require('../client/client.model');
var Project = require('./project.model')

var user = new User({
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password',
});

var adminUser = new User({
  provider: 'local',
  name: 'Fake Admin User',
  email: 'admin@admin.com',
  password: 'admin',
  role: 'admin'
});

var clientA = new Client({
  name: 'Client A',
  prefix: 'CA',
  contact : [],
  defaultRate: 50,
  associatedUsers: [],
  active: true
});

var clientB = new Client({
  name: 'Client B',
  prefix: 'CB',
  contact : [],
  defaultRate: 50,
  associatedUsers: [],
  active: true
});

var agent, adminUserToken, adminUserId, adminTimeId,
  userAgent, userToken, userId, userTimeId;

function clearDb(callback) {
  async.parallel([
    function(cb) {Client.find({}).remove(cb);},
    function(cb) {User.find({}).remove(cb);},
    function(cb) {Project.find({}).remove(cb);},
  ], callback);
}

describe('Project API', function() {

  before(function(done) {
    clearDb(done);
  });

  before(function(done){
    adminUser.save(function(err){
      if (err) return done(err);
      adminUserId = adminUser._id
      agent=request.agent(app);
      agent.post('/auth/local')
        .send({"email":"admin@admin.com","password":"admin"})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res){
          if (err) return done(err);
          should.exist(res.body.token);
          adminUserToken = res.body.token;
          done();
        });
    });
  });

  before(function(done){
    user.save(function(err) {
      if (err) return done(err);
      userId = user._id;
      userAgent=request.agent(app);
      userAgent.post('/auth/local')
        .send({"email":"test@test.com","password":"password"})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res){
          if (err) return done(err);
          should.exist(res.body.token);
          userToken = res.body.token;
          done();
        });
    });
  });

  before(function(done) {
    clientA.save(function(err){
      if (err) return done(err);
      clientB.save(function(err) {
        if (err) return done(err);
        done();
      });
    });
  });

  after(function(done) {
    User.remove().exec().then(function() {
      Client.remove().exec().then(function() {
        Project.remove().exec().then(function() {
          done();
        });
      });
    });
  });

  it('should respond with JSON array', function(done) {
    agent.get('/api/projects')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('should allow an admin to add a project', function(done) {
    /*
    var project = { name : 'Test Project', note : 'TEST', rate: 50, cilentId: clientA._id }
    agent.post('/api/projects')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .send(project)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) return done(err)
        should.exists(res.body)
        done();
      });
    */
    var project = { name : 'Test Project', note : 'TEST', rate: 50, clientId: clientA._id}
    agent.post('/api/projects')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .send(project)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) return done(err);
        should.exist(res.body);
        done();
      });
  });

  it('should allow a non-admin to add a project', function(done) {
    var project = { name : 'Test Project', note : 'TEST', rate: 50, clientId: clientB._id}
    userAgent.post('/api/projects')
      .set('Authorization', 'Bearer ' + userToken)
      .send(project)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) return done(err);
        should.exist(res.body);
        done();
      });
  });

  it('should return 2 projects', function(done) {
    agent.get('/api/projects')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.should.have.length(2)
        done();
      });
  });

  it('should return 1 project', function(done) {
    agent.get('/api/projects?clientId=' + clientA._id)
      .set('Authorization', 'Bearer ' + adminUserToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.should.have.length(1)
        done();
      });
  });

});
