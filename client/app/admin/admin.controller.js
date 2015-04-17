'use strict';

angular.module('ciceroApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User, Modal, Client) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.clients = Client.query();

    $scope.allowedRoles = ['admin', 'user'];

    $scope.delete = function(user){
      User.getCSRFToken(function(res){
        User.remove({ id: user._id, csrfToken: res.csrfToken });
        angular.forEach($scope.users, function(u, i) {
          if (u === user) {
            $scope.users.splice(i, 1);
          }
        });
      });
    }

    $scope.setUserRole = function(user) {
      if (user.selectedRole){
        User.changeRole({ id: user._id }, { role: user.selectedRole },
          angular.forEach($scope.users, function(u, i) {
            if (u === user) {
              $scope.users[i].role=user.selectedRole;
              delete user.selectedRole;
            }
          })
        );
      }
    };

    $scope.labelClass = function(role) {
      return {
        admin : 'success',
        user : 'primary'
      }[role]
    };

    $scope.confirmUserDelete = Modal.confirm.delete($scope.delete);

  });
