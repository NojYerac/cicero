'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('./user.model');
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
var agent, adminUserToken, userToken;

describe("GET /api/users", function() {

  before(function(done){
    user.save(function(err) {
      if (err) return done(err);
      adminUser.save(function(err){
        if (err) return done(err);
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
  });

  before(function(done) {
    done();
  });

  it('should respond with JSON array', function(done) {
    agent.get('/api/users')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('should respond with a user profile object', function(done) {
    agent.get('/api/users/me')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Object);
          res.body.email.should.equal('admin@admin.com');
          res.body._id.should.be.instanceof(String);
          done();
        });
  });

  it('should respond with a CSRF token', function(done){
    agent.get('/api/users/csrf')
      .set('Authorization', 'Bearer ' + adminUserToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.csrfToken.should.be.instanceof(String);
        done();
      });
  });

});
