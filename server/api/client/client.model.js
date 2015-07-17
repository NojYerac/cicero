'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContactSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

var ClientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  contact : [ContactSchema],
  associatedUsers: Array,
  active: {
    type: Boolean,
    required: true
  },
});

module.exports = mongoose.model('Client', ClientSchema);
