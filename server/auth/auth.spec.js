'use strict';

var should = require('should');
var app = require('../app');
var request = require('supertest');
var User = require('../api/user/user.model');
var user = new User({
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password',
});

var agent = request.agent(app);


describe("Auth API", function() {

  before(function(done){
    user.save(function(err) {
      done(err);
    })
  });

  it('should validate a valid login', function(done){
    agent.post('/auth/local')
      .send({
        "email": "test@test.com",
        "password": "password"
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should.exist(res.body.token);
        done();
      });
  });

  it('should invalidate a login attemept if the password is incorrect', function(done) {
    agent.post('/auth/local')
      .send({
        "email": "test@test.com",
        "password": "xxx"
      })
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        should.not.exist(err);
        res.body.should.have.property('message')
          .which.is.an.instanceOf(String)
          .and.equal('The email or password is not correct.');
        done();
      });
  });

  it('should invalidate a login attemept if the email is incorrect', function(done) {
    agent.post('/auth/local')
    .send({
      "email": "xxx",
      "password": "password"
    })
    .expect(401)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      should.not.exist(err);
      res.body.should.have.property('message')
        .which.is.an.instanceOf(String)
        .and.equal('The email or password is not correct.');
      done();
    });
  });

  after(function(done) {
    user.remove(function(err) {
      done(err);
    })
  })
});
