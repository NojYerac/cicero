var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
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
        /*
        if (!user) {
          return done(null, false, { message: 'This email is not registered.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'This password is not correct.' });
        }
        */
        if ( !user ) {
          User.authenticate.apply({hashedPassword:'x'},  password)
        } else if ( user.authenticate(password) ) {
          return done(null, user);
        }
        return done(null, false, {message:'The email or password is not correct.'});
      });
    }
  ));
};
