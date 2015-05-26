'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  contact : Array,
  defaultRate: {
    type: Number,
    required: true
  },
  associatedUsers: Array,
  active: {
    type: Boolean,
    required: true
  },
});

module.exports = mongoose.model('Client', ClientSchema);
