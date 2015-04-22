'use strict';

angular.module('ciceroApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User, Time, Project, Modal, Client) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();
    $scope.newUser = {
      name: '',
      email: '',
      password: '',
      role: 'user'
    };

    $scope.activeTab = 'users';

    $scope.clients = Client.query();

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

    $scope.userById = {};
    angular.forEach($scope.users, function(c,i){$scope.userById[c._id]=c;});

    $scope.clientById = {};
    angular.forEach($scope.clients, function(c,i){$scope.clientById[c._id]=c;});

    // $scope.projects = Project.query();
    //
    // $scope.projectById = {};
    // angular.forEach($scope.projects, function(p,i){$scope.projectById[p._id]=p;});



    $scope.times = Time.query();
    angular.forEach($scope.times, function(t, i){
      t.client = $scope.clientById[t.clientId];
      t.project = $scope.projectById[t.projectId];
      t.user = $scope.userById[t.userId];
    });

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
    $scope.newProject = false;

    $scope.$watch(
    function() {
       return $scope.thisProject;
    }, $scope.projectFormChange
    );

    $scope.projectFormChange = function(){
      $scope.thisProject.saved =
      $scope.thisProject.error =
      false;
    };

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
    }

    $scope.populateProjectOptions = function() {
      if (!$scope.selectedClient._id) return $scope.projectOptions = [];
      Project.query({clientId:$scope.selectedClient._id},
        function(data) {
          $scope.projectOptions = data;
        }, function(err) {
          console.log(err);
        });
    };


    $scope.createProject = function() {
      Project.save($scope.thisProject,
        function(data){
          $scope.projectOptions.push(data);
          $scope.thisProject._id = data._id;
          $scope.thisProject.saved = true;
        }, function(err){
          console.log(err);
        });
    };

    $scope.editProject = function() {
      Project.update(
        {id:$scope.thisProject._id},
        $scope.thisProject,
        function(data){
          $scope.thisProject.saved = true;
        }, function(err) {
          $scope.thisProject.error = true;
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
            }
          });
        }, function(err) {
          $scope.thisProject.error = true;
        });
    };

    $scope.confirmDeleteProject = Modal.confirm.delete($scope.deleteProject);

  });
