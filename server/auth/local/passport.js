var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var _ = require('lodash');
var User = User || require('../../api/user/user.model');


exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);
        /**
         * prevent timing attack by simulating a hash check
         * even if the email is invalid.
         * @return {boolean} false
         */
        var spinWheels = function() {
          User.schema.methods.authenticate(password)
          return false;
        }
        if ( (user || spinWheels()) && user.authenticate(password) ) {
          return done(null, user);
        }
        return done(null, false, {message:'The email or password is not correct.'});
      });
    }
  ));
};
