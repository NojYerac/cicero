'use strict';

angular.module('ciceroApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [
      {
        title: 'Timer',
        link: '/timer',
        icon: 'time',
        requireAuth: true,
        requireAdmin: false
      },
      {
        title: 'Admin',
        link: '/admin',
        requireAuth: true,
        requireAdmin: true
      }
    ];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.showItem = function(item) {
      if (item.requireAuth) {
        if (!$scope.isLoggedIn()) { return false; }
      }
      if (item.requireAdmin) {
        if (!$scope.isAdmin()) { return false; }
      }
      return true;
    };
  });
