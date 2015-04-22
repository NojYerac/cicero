'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
  name: String,
  prefix: String,
  contact : Array,
  defaultRate: Number,
  associatedUsers: Array,
  active: Boolean
});

module.exports = mongoose.model('Client', ClientSchema);
