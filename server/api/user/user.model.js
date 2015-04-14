'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var config = require('../../config/environment');

var authTypes = ['github', 'twitter', 'facebook', 'google'];
var allowedRoles = ['admin','user'];
var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  csrfTokens: Array,
  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {}
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

// CSRF Token
UserSchema
  .virtual('csrf')
  .get(function() {
    if (this.csrfTokens) {
      var tokens = [];
      for (var i=0; i<this.csrfTokens.length; ++i) {
        var createdAt=this.csrfTokens[i].createdAt
        if ((60*60*12)<((new Date())-createdAt)) {
          tokens.push(this.csrfTokens[i]);
        }
      }
    }
    //this.csrfTokens = this.csrfTokens || {};
    var token={
      token : crypto.randomBytes(20).toString('hex'),
      createdAt : new Date()
    }
    this.csrfTokens.push(token);
    return token.token
    //return Object.keys(this.csrfTokens)[0];
  })
  .set(function(csrfToken) {
    if (this.csrfTokens) {
      var tokens = [], valid=false;
      for (var i=0; i<this.csrfTokens.length; ++i) {
        var createdAt=this.csrfTokens[i].createdAt
        if ((60*60*1000)>((new Date())-createdAt)) {
          if (csrfToken === this.csrfTokens[i].token) {
            valid = true;
          }
          else {
            tokens.push(this.csrfTokens[i]);
          }
        }
      }
      this.csrfTokens=tokens;
    }
    if (!valid) throw (Error('Invalid CSRF token'));
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

UserSchema
  .path('role')
  .validate(function() {
    if (config.userRoles.indexOf(this.role) === -1) return false;
    return true;
  }, 'Invalid role');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1) {
      next(new Error('Invalid password'));
    }
    else if (!validatePresenceOf(this.role) || allowedRoles.indexOf(this.role) === -1) {
      next(new Error('Invalid role'));
    }
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
