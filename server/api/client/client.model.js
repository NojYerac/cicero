'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
  name: String,
  prefix: String,
  contact : { type: Array, default: [
    { type : 'email', label : 'Primary', value : '' },
    { type : 'address', label : 'Primary', value : '' },
    { type : 'phone', label : 'Primary', value : '' }
  ]},
  defaultRate: Number,
  active: Boolean
});

module.exports = mongoose.model('Client', ClientSchema);
