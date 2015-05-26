'use strict';

angular.module('ciceroApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/timer', {
        templateUrl: 'app/timer/timer.html',
        controller: 'TimerCtrl'
      });
  });
