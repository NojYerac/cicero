'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TimeSchema = new Schema({
  note: String,
  startTime: Date,
  endTime: {
    type: Date,
    default: new Date(0)
  },
  userId: String,
  clientId: String,
  projectId: String,
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
TimeSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();
    //check for active times under this user
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
