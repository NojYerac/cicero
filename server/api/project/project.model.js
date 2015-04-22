'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  note: String,
  clientId: {
    type: String,
    required: true
  },
  rate: Number
});

ProjectSchema
  .path('name')
  .validate(function(){
    if (!this.name) return false;
    return true;
  }, 'Invalid project name');


ProjectSchema
  .pre('save', function(next) {
    /*Client.findById(this.clientId, function(err, client) {
      if (err) next(err);
      if (client) {
        next();
      } else {
        next(new Error('Client not found!'));
      }
    });*/
    next();
  });


module.exports = mongoose.model('Project', ProjectSchema);
