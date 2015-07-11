'use strict';

// Production specific configuration
// =================================
//
var firstRun = require('./production');
firstRun.seedDB = true;
firstRun.env='production';
console.log(firstRun);
module.exports = firstRun;
