'use strict';

angular.module('ciceroApp')
  .controller('TimerCtrl', function ($scope, $interval, $log, $timeout, Auth, Client, Project, Time) {
    $scope.message = 'Hello';

    $scope.clients = Client.query();


    $scope.thisTime = {};

    $scope.manualEntry = false;

    $scope.theseTimes = [];

    $scope.saveTimes = function() {
      if ($scope.theseTimes.length === 0) {return alertError();}
      if ($scope.newProject) {
        if ($scope.thisProject._id) { delete $scope.thisProject._id; }
        angular.extend($scope.thisProject, {
          clientId : $scope.selectedClient._id,
        });
        Project.save($scope.thisProject,
        function(data) {
          $scope.newProject = !$scope.newProject;
          $scope.thisProject = data;
          alertSave(data);
          $scope.saveTimes();
        }, function(err) {
          alertError(err);
        });

        return;
      }
      while ($scope.theseTimes && $scope.theseTimes.length>0) {
        var time = $scope.theseTimes.shift();
        angular.extend(time,
          {
            clientId:$scope.selectedClient._id,
            projectId:$scope.thisProject._id,
            userId: Auth.getCurrentUser()._id
          });
        Time.save(time, alertSave, alertError);
      }
      $scope.resetTimer();
    };

    $scope.removeTime = function(index) {
      $scope.theseTimes.splice(index, 1);
    };

    $scope.addTime = function(index) {
      var newTime = {};
      newTime.startTime = $scope.trunkateTime(
        $scope.theseTimes[index] ?
        $scope.theseTimes[index].endTime :
        new Date()
      );

      newTime.endTime = $scope.trunkateTime(
        (index < ( $scope.theseTimes.length - 1 )) ?
        $scope.theseTimes[index + 1].startTime :
        new Date()
      );

      if (newTime.endTime.getTime() - newTime.startTime.getTime() < 1000 * 60) {
        newTime.endTime.setTime(newTime.startTime.getTime() + 1000 * 60 * 10);
      }

      $scope.theseTimes.splice(index + 1, 0, newTime);
    };

    $scope.trunkateTime = function(time) {
      time.setMilliseconds(0);
      time.setSeconds(0);
      return new Date(time);
    };

    $scope.minutePlus = function(time) {
      var endTime = new Date(time.endTime.getTime() + 60000);
      endTime.setMilliseconds(0);
      endTime.setSeconds(0);
      time.endTime = endTime;
    };

    $scope.minuteMinus = function(time) {
      var endTime = new Date(time.endTime.getTime() - 60000);
      endTime.setMilliseconds(0);
      endTime.setSeconds(0);
      time.endTime = endTime;
    };

    $scope.resetTimer = function(){
        Time.latest({},
          function(data) {
            $scope.thisTime = data;
            $scope.timerActive = (new Date(data.endTime)).getTime() === $scope.zeroDay.getTime();
            $scope.manualEntry = false;
          }, function(err) {
            alertError(err);
            $scope.zeroTimer();
          });
        $scope.theseTimes = [{
          startTime: $scope.trunkateTime(new Date()),
          endTime: $scope.trunkateTime(new Date())
        }];
      };

    $scope.zeroTimer = function() {
      angular.extend($scope.thisTime, {
        clientId : $scope.selectedClient._id || '',
        projectId : $scope.thisProject._id || '',
        startTime : new Date(0),
        endTime : new Date(0),
      });
      $scope.projectOptions = [];
      $scope.selectedClient = {};
    };

    $scope.zeroDay = new Date(0);

    $scope.resetTimer();

    $scope.populateProjectOptions = function(callback) {
      var cb = callback || angular.noop;
      $log.log($scope.selectedClient);
      if (!($scope.selectedClient && $scope.selectedClient._id)) {
        $scope.projectOptions = [];
        return;
      }
      Project.query({clientId:$scope.selectedClient._id},
        function(data) {
          $scope.projectOptions = data;
          cb();
        }, function(err) {
          alertError(err);
        });
    };

    $scope.startTimer = function() {
      if (!$scope.thisProject) {return alertError();}
      if ($scope.newProject) {
        if ($scope.thisProject._id) { delete $scope.thisProject._id; }
        angular.extend($scope.thisProject, {
          clientId : $scope.selectedClient._id,
        });
        Project.save($scope.thisProject,
        function(data) {
          $scope.newProject = !$scope.newProject;
          $scope.thisProject = data;
          $scope.startTimer();
        }, function(err) {
          alertError(err);
        });

        return;
      }
      var startTime = new Date();
      startTime.setMilliseconds(0);
      startTime.setSeconds(0);
      angular.extend($scope.thisTime, {
        startTime : startTime,
        endTime : new Date(0),
        clientId : $scope.selectedClient._id,
        projectId : $scope.thisProject._id,
        });
      if ($scope.thisTime._id) { delete $scope.thisTime._id; }
      Time.start($scope.thisTime,
        function(data){
          $scope.thisTime = data;
          $scope.timerActive=true;
          $scope.startClicking();
        }, function(err){
          alertError(err);
        });
    };

    $scope.stopTimer = function() {
      var endTime = new Date();
      endTime.setMilliseconds(0);
      endTime.setSeconds(0);
      $scope.thisTime.endTime = endTime;
      Time.stop({id:$scope.thisTime._id || 'active'}, $scope.thisTime,
        function(){
          // $log.log(data);
          $scope.timerActive=false;
          $scope.stopClicking();
        }, function(err){
          alertError(err);
        });
    };

    $scope.getMinutesElapsed = function(time) {
      var msElapsed = time.endTime.getTime() - time.startTime.getTime();
      return Math.floor( msElapsed / ( 1000 * 60 ) );
    };

    $scope.$watch(
      'thisTime.endTime',
      function(newVal) {
        if (!newVal) { return; }
        if ($scope.thisTime.endTime.constructor !== Date) {
          // $log.log('endTime converted from\n' + $scope.thisTime.endTime + 'to');
          $scope.thisTime.endTime = new Date($scope.thisTime.endTime);
          // $log.log($scope.thisTime.endTime);
        }
        $scope.timerActive = $scope.thisTime.endTime.getTime() === $scope.zeroDay.getTime();
        // $log.log('timerActive => ' + $scope.timerActive);
        if ($scope.timerActive) {
          $scope.startClicking();
        } else {
          $scope.stopClicking();
        }
      });

    $scope.$watch(
      'thisTime.startTime',
      function(newVal) {
        if (!newVal || newVal.constructor !== Date) {
          $scope.thisTime.startTime = new Date($scope.thisTime.startTime || 0);
        }
      });

      $scope.$watch(
        'thisTime.clientId',
        function(newVal) {
          if (!newVal) { $scope.selectedClient = null; return;}
          if ($scope.selectedClient && $scope.selectedClient._id === newVal) {
            return;
          }
          angular.forEach($scope.clients,
            function(client) {
              if (newVal === client._id) {
                $scope.selectedClient = client;
                //$scope.populateProjectOptions();
              }
            });
        });

      $scope.$watch(
        'thisTime.projectId',
        function(newVal) {
          function selectProject() {
            angular.forEach($scope.projectOptions,
              function(project) {
                if (project._id === newVal) {
                  $scope.thisProject = project;
                }
              });
          }
          if (!newVal) {
            $scope.thisProject = null;
            return;
          }
          if ($scope.thisProject && $scope.thisProject._id === newVal) {
            return;
          }
          if (
            !($scope.projectOptions &&
            $scope.projectOptions.contains($scope.thisProject))
          ) {
            $scope.populateProjectOptions(selectProject);
            return;
          }
          selectProject();
        });

    $scope.elapsedTime = 0;
    var clicking;
    $scope.startClicking = function(){
      if (!angular.isDefined(clicking)) {
        clicking = $interval(
          function() {
            if (!$scope.timerActive) {
              // $log.log('not active');
              $scope.timerActive=!$scope.timerActive;
              return;
            }
            // $log.log('active');
            $scope.elapsedTime =  (Date.now() - $scope.thisTime.startTime.getTime());
          }, 1000);
      }
    };
    $scope.stopClicking = function() {
      if (angular.isDefined(clicking)) {
        $interval.cancel(clicking);
        clicking = undefined;
      }
    };

    $scope.$on('$destroy',
      function(){
        $scope.stopClicking();
      });

    $scope.displayElapsed = function() {
      var e = new Date($scope.elapsedTime);
      //$log.log(e);
      return '' + e.getUTCHours() + ':' +
        ('0' + e.getUTCMinutes()).slice(-2) + ':' +
        ('0' + e.getUTCSeconds()).slice(-2);
    };

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

  });
