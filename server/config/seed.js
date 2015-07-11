/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

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

Client.find({}).remove(function(){
  User.find({}).remove(function(){
    Project.find({}).remove(function(){
      Time.find({}).remove(function(){

        function addU() {
          clientU.save(function(){
            clientIdU = clientU._id;
            projectU.clientId = clientIdU;
            projectU.save(function(){
              projectIdU = projectU._id;
              user.canSeeClients = [clientIdU];
              user.save(function() {
                userIdU = user._id;
                var time = new Time({
                  clientId: clientIdU,
                  projectId: projectIdU,
                  userId: userIdU,
                  startTime: new Date(Date.now() - 60 * 60 * 1000),
                  endTime: new Date(Date.now())
                });
                time.save();
              });
            });
          });
        }

        clientA.save(function(){
          clientIdA = clientA._id;
          projectA.clientId = clientIdA;
          projectA.save(function(){
            projectIdA = projectA._id;
            adminUser.save(function(){
              userIdA = adminUser._id
              var time = new Time({
                clientId: clientIdA,
                projectId: projectIdA,
                userId: userIdA,
                startTime: new Date(Date.now() - 60 * 60 * 1000),
                endTime: new Date(Date.now())
              });
              time.save(addU);
            });
          });
        });
      });
    });
  });
});
