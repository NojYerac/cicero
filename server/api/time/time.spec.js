'use strict';
/*
global describe, before, after, beforeEach, afterEach, it, xit
 */
var should = require('should');
var request = require('supertest');
var _ = require('lodash');
var app = require('../../app');
var User = require('../user/user.model');
var Client = require('../client/client.model');
var Project = require('../project/project.model');
var Time = require('./time.model');
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
  name : 'Test Client A',
  prefix : 'TESTA',
  defaultRate: 50,
  contact: [],
  active:true
});
var clientU = new Client({
  name : 'Test Client U',
  prefix : 'TESTU',
  defaultRate: 50,
  contact: [],
  active:true
});
var projectA = new Project({
  name : 'Test Project A',
  note : 'TESTA',
  rate: 50
});
var projectU = new Project({
  name : 'Test Project U',
  note : 'TESTU',
  rate: 50
});
var agentA, authTokenA, userIdA, timeIdA, clientIdA, projectIdA,
    agentU, authTokenU, userIdU, timeIdU, clientIdU, projectIdU;

describe('Time API', function() {

  before(function(done){
    clientA.save(function(err){
      if (err) return done(err);
      clientIdA = clientA._id;
      //user.canSeeClients = [clientIdA];
      projectA.clientId = clientIdA;
      projectA.save(function(err){
        if (err) return done(err);
        projectIdA = projectA._id;
        adminUser.save(function(err){
          if (err) return done(err);
          userIdA = adminUser._id
          agentA=request.agent(app);
          agentA.post('/auth/local')
            .send({"email":"admin@admin.com","password":"admin"})
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res){
              if (err) return done(err);
              should.exist(res.body.token);
              authTokenA = res.body.token;
              done();
            });
        });
      });
    });
  });

  before(function(done){
    clientU.save(function(err){
      if (err) return done(err);
      clientIdU = clientU._id;
      user.canSeeClients = [clientIdU];
      user.save(function(err) {
        if (err) return done(err);
        userIdU = user._id;
        agentU=request.agent(app);
        agentU.post('/auth/local')
          .send({"email":"test@test.com","password":"password"})
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err) return done(err);
            should.exist(res.body.token);
            authTokenU = res.body.token;
            projectU.clientId = clientIdU;
            projectU.save(function(err){
              if (err) return done(err);
              projectIdU = projectU._id;
              done();
            });
          });
      });
    });
  });

  after(function(done) {
    User.remove().exec().then(function() {
      User.find({}, function(err, users){
        users.should.have.length(0);
        done();
      });
    });
  });

  after(function(done) {
    Client.remove().exec().then(function() {
      Client.find({}, function(err, clients) {
        clients.should.have.length(0);
        done();
      });
    });
  });

  after(function(done) {
    Project.remove().exec().then(function() {
      Project.find({}, function(err, projects) {
        projects.should.have.length(0);
        done();
      });
    });
  });

  after(function(done) {
    Time.remove().exec().then(function() {
      Time.find({}, function(err, times) {
        times.should.have.length(0);
        done();
      });
    });
  });

  it('should respond with JSON array', function(done) {
    agentA.get('/api/times')
      .set('Authorization', 'Bearer ' + authTokenA)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('should start a new time', function(done) {
    var time = {
      userId : userIdA,
      startTime: new Date(),
      clientId: clientIdA,
      projectId: projectIdA,
    };
    agentA.post('/api/times/')
      .set('Authorization', 'Bearer ' + authTokenA)
      .send(time)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        should.exist(res.body);
        timeIdA = res.body._id
        done();
      });
  });

  it('should not start a new time before stoping the previous one', function(done){
    var time = {
      startTime: new Date(),
      userId: userIdA,
      clientId: clientIdA,
      projectId: projectIdA,
    };
    agentA.post('/api/times/')
      .set('Authorization', 'Bearer ' + authTokenA)
      .send(time)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body);
        done();
      });
  });

  it('should start a new time before stoping times from other users', function(done) {
    var time = {
      startTime: new Date(),
      userId: userIdU,
      clientId: clientIdU,
      projectId: projectIdU,
    };
    agentU.post('/api/times/')
      .set('Authorization', 'Bearer ' + authTokenU)
      .send(time)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body);
        timeIdU = res.body._id
        done();
      });
  });

  it('should stop a time', function(done){
    var time = { endTime: new Date() };
    agentA.post('/api/times/'+timeIdA+'/stop')
      .set('Authorization', 'Bearer ' + authTokenA)
      .send(time)
      .expect(204)
      //.expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body);
        //should.exist(res.body.endTime)
        var time = { endTime: new Date() };
        agentU.post('/api/times/'+timeIdU+'/stop')
          .set('Authorization', 'Bearer ' + authTokenU)
          .send(time)
          .expect(204)
          //.expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);
            should.exist(res.body);
            //should.exist(res.body.endTime)
            done();
          });
      });
  });

  it('should not start with an invalid projectId', function(done){
    var time = {
      startTime: new Date(),
      userId: userIdA,
      clientId: clientIdA,
      projectId: '!',
    };

    agentA.post('/api/times/')
      .set('Authorization', 'Bearer ' + authTokenA)
      .send(time)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body);
        _.extend( time, {
          clientId: clientIdU,
          projectId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
          userId: userIdU
        });
        time.projectId.should.have.length(24);
        agentU.post('/api/times/')
          .set('Authorization', 'Bearer ' + authTokenU)
          .send(time)
          .expect(500)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);
            should.exist(res.body);
            done();
          });
      });

  });

  it('should not start with a valid but non-existant projectId', function(done) {
    var time = {
      startTime: new Date(),
      userId: userIdA,
      clientId: clientIdA,
      projectId: '0a0a0a0a0a0a0a0a0a0a0a0a'
    };
    time.projectId.should.have.length(24);
    time.projectId.should.match(/^[0-9a-f]{24}$/)
    agentA.post('/api/times/')
      .set('Authorization', 'Bearer ' + authTokenA)
      .send(time)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body);
        done();
      });
  });

  it('should not start with an invalid clientId', function(done){
    var time = {
      startTime: new Date(),
      userId: userIdA,
      clientId: '!',
      projectId: projectIdA,
    };
    agentA.post('/api/times/')
      .set('Authorization', 'Bearer ' + authTokenA)
      .send(time)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        //console.log(res);
        if (err) return done(err);
        should.exist(res.body);
        _.extend( time, {
          clientId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
          projectId: projectIdU,
          userId: userIdU
        });
        time.clientId.should.have.length(24);
        agentU.post('/api/times/')
          .set('Authorization', 'Bearer ' + authTokenU)
          .send(time)
          .expect(403)
          //.expect('Content-Type', /text\/plain/)
          .end(function(err, res) {
            //console.log(res);
            if (err) return done(err);
            should.exist(res.body);
            done();
          });
      });
  });

  it('should not start with a valid but non-existant clientId', function(done) {
    var time = {
      startTime: new Date(),
      userId: userIdA,
      projectId: projectIdA,
      clientId: '0a0a0a0a0a0a0a0a0a0a0a0a'
    };
    time.clientId.should.have.length(24);
    time.clientId.should.match(/^[0-9a-f]{24}$/);
    agentA.post('/api/times/')
      .set('Authorization', 'Bearer ' + authTokenA)
      .send(time)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body);
        done();
      });
  });

  it('should not start with a valid but non-existant userId', function(done) {
    var time = {
      startTime: new Date(),
      userId: '!',
      clientId: clientIdA,
      projectId: projectIdA,
    };
    agentA.post('/api/times/')
      .set('Authorization', 'Bearer ' + authTokenA)
      .send(time)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body);
        _.extend( time, {
          userId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
          projectId: projectIdU,
          clientId: clientIdA
        });
        time.userId.should.have.length(24);
        agentU.post('/api/times/')
          .set('Authorization', 'Bearer ' + authTokenU)
          .send(time)
          .expect(403)
          //.expect('Content-Type', /text\/plain/)
          .end(function(err, res) {
            if (err) return done(err);
            should.exist(res.body);
            done();
          });
      });
  });

  it('should not start with an invalid userId', function(done){
    var time = {
      startTime: new Date(),
      userId: '0a0a0a0a0a0a0a0a0a0a0a0a',
      projectId: projectIdA,
      clientId: clientIdA
    };
    time.userId.should.have.length(24);
    time.userId.should.match(/^[0-9a-f]{24}$/);
    agentA.post('/api/times/')
      .set('Authorization', 'Bearer ' + authTokenA)
      .send(time)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body);
        done();
      });
  });

});
