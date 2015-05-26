'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Project = require('../project/project.model');
var Client = require('../client/client.model');
var User = require('../user/user.model');

var TimeSchema = new Schema({
  note: String,
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    default: new Date(0)
  },
  userId: {
    type: String,
    required: true
  },
  clientId: {
    type:String,
    required: true
  },
  projectId: {
    type:String,
    required: true
  }
});

/**
 * Virtuals
 */
TimeSchema
  .virtual('active')
  .get(function(){
    return this.endTime.getTime() === 0;
  })
  .set(function(){
    this.endTime.setTime(0);
  });

/**
 * Validations
 */

//validat project exists
TimeSchema
  .path('projectId')
  .validate(function(projectId, next) {
    if (!(
      projectId &&
      projectId.constructor === String &&
      projectId.length === 24 &&
      /[0-9a-f]/.test(projectId)
    )) return next( false );
    Project.findById(projectId, function(err, project) {
      if ( err  ) return next( false );
      next( !!project );
    });
  }, 'Invalid Project Id');

//validate client exists
TimeSchema
  .path('clientId')
  .validate(function(clientId, next) {
    if (!(
      clientId &&
      clientId.constructor === String &&
      clientId.length === 24 &&
      /[0-9a-f]/.test(clientId)
    )) return next( false );
    Client.findById(clientId, function(err, client) {
      if ( err ) return next( false );
      next( !!client );
    });
  }, 'Invalid Client Id');

//validate user exists
TimeSchema
  .path('userId')
  .validate(function(userId, next) {
    if (!(
      userId &&
      userId.constructor === String &&
      userId.length === 24 &&
      /[0-9a-f]/.test(userId)
    )) return next( false );
    User.findById(userId, function(err, user) {
      if ( err ) return next( false );
      next( !!user );
    });
  }, 'Invalid User Id');

TimeSchema
  .pre('save', function(next) {
    //if (!this.userId)  next(new Error('User id is required'));
    this.constructor.find(
      {userId: this.userId, endTime: new Date(0)},
      function(err, activeTimes) {
        if (err) throw err;
        if (activeTimes.length > 0) {
          return next(new Error('Only one active time allowed per user'));
        } else if(false){
          return next(new Error('Something is wrong'));
        } else {
          next();
        }
      });
  });

module.exports = mongoose.model('Time', TimeSchema);
