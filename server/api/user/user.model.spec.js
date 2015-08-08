'use strict';
/*
global describe, before, after, beforeEach, afterEach, it
 */
var should = require('should');
var app = require('../../app');
var User = require('./user.model');

var _user = {
    provider: 'local',
    name: 'Fake User',
    email: 'test@test.com',
    password: 'password',
    csrfTokens: []
  },
  user;

describe('User Model', function() {
  before(function(done) {
    // Clear users before testing
    User.remove().exec().then(function() {
      done();
    });
  });

  beforeEach(function(done) {
    user = new User(_user);
    done();
  })

  afterEach(function(done) {
    User.remove().exec().then(function() {
      User.find({}, function(err, users) {
        users.should.have.length(0);
        done();
      });
    });
  });

  it('should begin with no users', function(done) {
    User.find({}, function(err, users) {
      users.should.have.length(0);
      done();
    });
  });

  it('should succeed when saving a valid user', function(done) {
    user.save(function(error, user) {
      should.not.exist(error);
      should.exist(user);
      done();
    })
  })

  it('should fail when saving a duplicate user', function(done) {
    user.save(function(err) {
      should.not.exists(null);
      var userDup = new User(user);
      userDup.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  it('should fail when saving without an email', function(done) {
    user.email = '';
    user.save(function(err) {
      should.exist(err);
      err.should.have.property('message', 'User validation failed');
      err.errors.email.should.have.property('message', 'Email cannot be blank');
      done();
    });
  });

  it("should authenticate user if password is valid", function() {
    return user.authenticate('password').should.be.true;
  });

  it("should not authenticate user if password is invalid", function() {
    return user.authenticate('blah').should.not.be.true;
  });

  it("should change the role to admin", function(done) {
    user.save(function(err) {
      should.not.exist(err);
      user.role = 'admin';
      user.save(function(err) {
        should.not.exist(err);
        user.role.should.equal('admin');
        done();
      });
    })

  });

  it("should return a CSRF token", function(done) {
    var token = user.csrf;
    user.csrfTokens.should.have.length(1);
    user.csrfTokens[0].token.should.equal(token);
    done();
  });

  it("should invalidate a bad CSRF token", function(done) {
    var token = user.csrf;
    user.csrfTokens.should.have.length(1);
    try {
      user.csrf = 'abc';
    } catch (err) {
      should.exist(err);
    }
    user.csrfTokens.should.have.length(1);
    done();
  });

  it("should expire old CSRF tokens", function(done) {
    var token = user.csrf
    user.csrfTokens.should.have.length(1);
    //make token 2 hours old
    user.csrfTokens[0].createdAt = new Date(Date.now() - (2 * 60 * 60 * 1000));
    try {
      user.csrf = token;
    } catch (err) {
      should.exist(err);
      err.should.have.property('message')
      err.message.should.equal('Invalid CSRF token');
    }
    user.csrfTokens.should.have.length(0);
    done();

  })

  it("should validate a good CSRF token", function(done) {
    var token = user.csrf;
    try {
      user.csrf = token
    } catch (err) {
      should.not.exist(err);
    } finally {
      user.csrfTokens.should.have.length(0);
    }
    done();
  });


});
