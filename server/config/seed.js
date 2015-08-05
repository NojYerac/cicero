/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
var async = require('async');
// var Thing = require('../api/thing/thing.model');
//
// Thing.find({}).remove(function() {
//   Thing.create({
//     name : 'Development Tools',
//     info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
//   }, {
//     name : 'Server and Client integration',
//     info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
//   }, {
//     name : 'Smart Build System',
//     info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
//   },  {
//     name : 'Modular Structure',
//     info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
//   },  {
//     name : 'Optimized Build',
//     info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
//   },{
//     name : 'Deployment Ready',
//     info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
//   });
// });

var User = require('../api/user/user.model');
var Client = require('../api/client/client.model');
var Project = require('../api/project/project.model');
var Time = require('../api/time/time.model');

var user = new User({
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'test',
});
var adminUser = new User({
  provider: 'local',
  name: 'Fake Admin User',
  email: 'admin@admin.com',
  password: 'admin',
  role: 'admin'
});
var clientA = new Client({
  name : 'Test Client A',
  prefix : 'TESTA',
  defaultRate: 50,
  contact: [],
  active:true
});
var clientU = new Client({
  name : 'Test Client U',
  prefix : 'TESTU',
  defaultRate: 50,
  contact: [],
  active:true
});
var projectA = new Project({
  name : 'Test Project A',
  note : 'TESTA',
  rate: 50
});
var projectU = new Project({
  name : 'Test Project U',
  note : 'TESTU',
  rate: 50
});

var userIdA,
    timeIdA,
    clientIdA,
    projectIdA,
    userIdU,
    timeIdU,
    clientIdU,
    projectIdU;

function clearDb(callback) {
  async.parallel([
    function(cb) {Client.find({}).remove(cb)},
    function(cb) {User.find({}).remove(cb)},
    function(cb) {Project.find({}).remove(cb)},
    function(cb) {Time.find({}).remove(cb)},
  ], callback);
}

function addU(callback) {
  async.series([
    function(cb) { clientU.save(cb); },
    function(cb) {
      clientIdU = clientU._id;
      projectU.clientId = clientIdU;
      cb();
    },
    function(cb) { projectU.save(cb); },
    function(cb) {
      projectIdU = projectU._id;
      user.canSeeClients = [clientIdU];
      cb();
    },
    function(cb) { user.save(cb) },
    function(cb) {
      userIdU = user._id;
      var time = new Time({
        clientId: clientIdU,
        projectId: projectIdU,
        userId: userIdU,
        startTime: new Date(Date.now() - 60 * 60 * 1000),
        endTime: new Date(Date.now())
      });
      time.save(cb);
    }
  ], callback);
}

function addA(callback) {
  async.series([
    function(cb) { clientA.save(cb); },
    function(cb) {
      clientIdA = clientA._id;
      projectA.clientId = clientIdA;
      cb();
    },
    function(cb) { projectA.save(cb); },
    function(cb) {
      projectIdA = projectA._id;
      cb();
    },
    function(cb) { adminUser.save(cb) },
    function(cb) {
      userIdA = adminUser._id;
      var time = new Time({
        clientId: clientIdA,
        projectId: projectIdA,
        userId: userIdA,
        startTime: new Date(Date.now() - 60 * 60 * 1000),
        endTime: new Date(Date.now())
      });
      time.save(cb);
    }
  ], callback);
}

function seedDb(callback) {
  async.parallel([
    addA,
    addU
  ], callback);
}

async.series([
  clearDb,
  seedDb
], function(err) {
  if (err) console.error(err);
});
