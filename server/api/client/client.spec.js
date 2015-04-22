'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('../user/user.model');
var Client = require('./client.model')
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
var agent, adminUserToken, adminUserId, adminTimeId,
  userAgent, userToken, userId, userTimeId;

describe('Client API', function() {

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

  after(function(done) {
    User.remove().exec().then(function() {
      Client.remove().exec().then(function() {
        done();
      });
    });
  });

  it('should respond with JSON array', function(done) {
    agent.get('/api/clients')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('should allow an admin to add a client', function(done) {
    var client = { name : 'Test Client', prefix : 'TEST', defaultRate: 50}
    agent.post('/api/clients')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .send(client)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if (err) return done(err)
        should.exists(res.body)
        done();
      });
  });

  it('should not allow a non-admin to add a client', function(done) {
    var client = { name : 'Test Client', prefix : 'TEST', defaultRate: 50}
    userAgent.post('/api/clients')
      .set('Authorization', 'Bearer ' + userToken)
      .send(client)
      .expect(403)
      .expect('Content-Type', /text\/plain/)
      .end(function(err, res){
        if (err) return done(err)
        res.text.should.equal('Forbidden')
        done();
      });
  });

});
