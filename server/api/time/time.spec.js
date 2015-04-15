'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('../user/user.model');
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

describe('GET /api/time', function() {

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
      done();
    });
  });

  it('should respond with JSON array', function(done) {
    agent.get('/api/time')
      .set('Authorization', 'Bearer ' + adminUserToken)
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
      userId : adminUserId,
      startTime: new Date(),
      clientId: '1234567890abcdef1234567890abcdif',
      projectId: 'abcdef0987654321abcdef0987654321',
    };
    agent.post('/api/time/')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .send(time)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        should.exist(res.body);
        adminTimeId = res.body._id
        done();
      });
  });

  it('should not start a new time before stoping the previous one', function(done){
    var time = {
      startTime: new Date(),
      userId: adminUserId,
      clientId: '1234567890abcdef1234567890abcdif',
      projectId: 'abcdef0987654321abcdef0987654321',
    };
    agent.post('/api/time/')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .send(time)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        should.exist(res.body);
        done();
      });
  });

  it('should start a new time before stoping times from other users', function(done) {
    var time = {
      startTime: new Date(),
      userId: userId,
      clientId: '1234567890abcdef1234567890abcdif',
      projectId: 'abcdef0987654321abcdef0987654321',
    };
    userAgent.post('/api/time/')
      .set('Authorization', 'Bearer ' + userToken)
      .send(time)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        should.exist(res.body);
        userTimeId = res.body._id
        done();
      });
  });

  it('should stop a time', function(done){
    var time = { endTime: new Date() };
    agent.post('/api/time/'+adminTimeId+'/stop')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .send(time)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        console.log(res.body);
        should.exist(res.body);
        should.exist(res.body.endTime)
        done();
      });
  });

});

//describe('GET /api/')
