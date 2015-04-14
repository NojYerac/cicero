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
  

module.exports = mongoose.model('Time', TimeSchema);
