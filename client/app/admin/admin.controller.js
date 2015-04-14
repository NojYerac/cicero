'use strict';

angular.module('ciceroApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.allowedRoles = ['admin', 'user'];

    $scope.delete = function(user){
      User.getCSRFToken(function(res){
        console.log(res.csrfToken);
        User.remove({ id: user._id, csrfToken: res.csrfToken });
        angular.forEach($scope.users, function(u, i) {
          if (u === user) {
            $scope.users.splice(i, 1);
          }
        });
      });
    }

    $scope.setUserRole = function(user) {
      //console.log(user._id);
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

  });
