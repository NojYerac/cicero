'use strict';

angular.module('ciceroApp')
  .controller('AdminCtrl', function ($scope, $log, $http, $timeout, Auth, User, Time, Project, Modal, Client, socket) {
    $scope.$log = $log;
    // Use the User $resource to fetch all users
    $scope.users = [];

    $scope.newUser = {
      name: '',
      email: '',
      password: '',
      canSeeClients: [],
      role: 'user'
    };

    $scope.activeTab = 'users';
    if (window.location.hash) {
      $scope.activeTab = window.location.hash.slice(1);
    }
    $scope.clients = [];

    $scope.newClient = {
      name : '',
      prefix : '',
      rate : '',
      active : true,
      isOpen : false,
      contact : [
        { type : 'email', label : 'Primary', value : '' },
        { type : 'address', label : 'Primary', value : '' },
        { type : 'phone', label : 'Primary', value : '' }
      ],
    };

    $scope.projects = [];

    $scope.times = [];

    Project.query({}, function(data) {
      $scope.projects=data;
      socket.syncUpdates('projects', $scope.projects);
      User.query({}, function(data) {
        $scope.users = data;
        socket.syncUpdates('users', $scope.users);
        Client.query({}, function(data){
          $scope.clients = data;
          socket.syncUpdates('clients', $scope.clients);
          Time.query({}, function(data){
            angular.forEach(data, function(time, i){
              angular.extend(data[i], {
                startTime : new Date(time.startTime),
                endTime : new Date(time.endTime),
                user : $scope.userById(time.userId),
                client : $scope.clientById(time.clientId),
                project : $scope.projectById(time.projectId)
              });
              $scope.times.push(data[i]);
            });
            socket.syncUpdates('times', $scope.times);
            $scope.editTimeModal = Modal.edit.time($scope.editTime);
            //$log.log($scope.times);
          });
        });
      });
    });

    $scope.timeTableHeadings = [
      {formattedName: 'User', name: 'user'},
      {formattedName: 'Client', name: 'cilent'},
      {formattedName: 'Project', name: 'project'},
      {formattedName: 'Start Time', name: 'startTime'},
      {formattedName: 'End Time', name: 'endTime'},
    ];

    $scope.sortTimesBy = 'startTime';
    $scope.reverseTimeSort = true;

    $scope.setSortTimesBy = function(column) {
      if ($scope.sortTimesBy === column) {
        $scope.reverseTimeSort = !$scope.reverseTimeSort;
      } else {
        $scope.sortTimesBy = column;
        $scope.reverseTimeSort = true;
      }
    };

    $scope.editTime = function(time) {
      $log.log(this);
      $log.log(time);
      Time.update(
        {id:this._id},
        {
          userId: this.userId,
          clientId: this.clientId,
          projectId: this.projectId,
          startTime: this.startTime,
          endTime: this.endTime
        },
        function(data) {
          alertSave(data);
        }, function(err) {
          alertError(err);
        });
    };

    $scope.selectedClient={};

    $scope.projectOptions = [];
    $scope.thisProject = {
      clientId : '',
      name : '',
      note : '',
      rate : 35,
      saved : false,
      error : false
    };
    $scope.newProject = true;

    // $scope.$watch(
    // function() {
    //    return $scope.thisProject;
    // }, $scope.projectFormChange
    // );
    //
    // $scope.projectFormChange = function(){
    //   $scope.thisProject.saved =
    //   $scope.thisProject.error =
    //   false;
    // };

    $scope.newProjectClick = function() {
      $scope.newProject = !$scope.newProject;
      if ($scope.newProject) {
        $scope.thisProject = {
          clientId : $scope.selectedClient._id || '',
          name : $scope.thisProject.name || '',
          note : $scope.thisProject.note || '',
          rate : $scope.selectedClient.defaultRate || 35
        };
      }
    };

    $scope.populateProjectOptions = function() {
      if (!($scope.selectedClient && $scope.selectedClient._id)) {
        $scope.projectOptions = [];
        return;
      }
      Project.query({clientId:$scope.selectedClient._id},
        function(data) {
          $scope.projectOptions = data;
        }, function(err) {
          alertError(err);
        });
    };

    $scope.createProject = function() {
      Project.save($scope.thisProject,
        function(data){
          $scope.projectOptions.push(data);
          $scope.thisProject._id = data._id;
          $scope.newProject = false;
          alertSave(data);
        }, function(err){
          alertError(err);
        });
    };

    $scope.editProject = function() {
      Project.update(
        {id:$scope.thisProject._id},
        $scope.thisProject,
        function(data){
          alertSave(data);
        }, function(err) {
          alertError(err);
        });
    };

    $scope.deleteProject = function() {
      Project.delete(
        { id : $scope.thisProject._id },
        function(data) {
          angular.forEach($scope.projectOptions, function(p, i) {
            if ( p._id === $scope.thisProject._id ) {
              $scope.projectOptions.splice(i, 1);
              $scope.thisProject = {
                clientId : $scope.selectedClient._id || '',
                name : '',
                note : '',
                rate : $scope.selectedClient.defaultRate || 35
              };
              alertSave(data);
            }
          });
        }, function(err) {
          alertError(err);
        });
    };

    $scope.confirmDeleteProject = Modal.confirm.delete($scope.deleteProject);

    $scope.alerts = [];

    function alertSave() {
      $scope.alerts.push({
        type:'success',
        message:'Saved successfully!',
        icon:'ok'
      });
      $timeout(function(){
        $scope.alerts.shift();
      }, 2000);
    }
    $scope.alertSave = alertSave;

    function alertError(err) {
      //$log.log(err.data);
      $scope.alerts.push({
        type: 'danger',
        message: err.data.message || 'An error occured!',
        icon: 'exclamation-sign',
        err: (function(err){
          var formatted = '';
          angular.forEach(Object.keys(err.data.errors),
            function(e){
              formatted += err.data.errors[e].message + '\n';
            });
          return formatted;
        })(err),
      });
      $timeout(function(){
        $scope.alerts.shift();
      }, 2000);
    }
    $scope.alertError = alertError;

    $scope._userById = {};
    $scope.userById = function(id) {
      if (!$scope._userById[id]){
        angular.forEach($scope.users,
          function(user) {
            $scope._userById[user._id] = user.name;
          });
      }
      return $scope._userById[id];
    };

    $scope._clientById = {};
    $scope.clientById = function(id) {
      if (!$scope._clientById[id]){
        angular.forEach($scope.clients,
          function(client) {
            $scope._clientById[client._id] = client.name;
          });
      }
      return $scope._clientById[id];
    };

    $scope._projectById = {};
    $scope.projectById = function(id) {
      if (!$scope._projectById[id]){
        angular.forEach($scope.projects,
          function(project) {
            $scope._projectById[project._id] = project.name;
          });
      }
      return $scope._projectById[id];
    };

  });
