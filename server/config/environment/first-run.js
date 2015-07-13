'use strict';

// Production specific configuration
// =================================
//
var firstRun = require('./production');
firstRun.seedDB = true;
firstRun.env='production';
module.exports = firstRun;
