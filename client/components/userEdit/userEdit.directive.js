'use strict';

angular.module('ciceroApp')
  .directive('userEdit', function ($log, User, Modal) {
    return {
      templateUrl: 'components/userEdit/userEdit.html',
      restrict: 'EA',
      scope : {
        user : '=user',
        users : '=users',
        clients : '=clients',
        alertError : '=alertError',
        alertSave : '=alertSave'
      },
      link: function (scope) { /* (scope, element, attrs) { */
        //$log.log(scope.alertError);
        scope.newUser = !(scope.user && scope.user._id);

        scope.deleteUser = function() {
          User.getCSRFToken(function(res){
            User.remove({ id: scope.user._id, csrfToken: res.csrfToken },
              function(data) {
                angular.forEach(scope.users, function(u, i) {
                  if (u === scope.user) {
                    scope.users.splice(i, 1);
                    scope.alertSave(data);
                  }
                });
              }, function(err) {
                scope.alertError(err);
              });
          });
        };

        scope.createUser = function() {
          User.save(scope.user, function(data){
            scope.users.push(data);
            scope.resetUser();
            scope.alertSave();
          },function(err){
            scope.alertError(err);
          });
        };

        scope.resetUser = function() {
          if (scope.user._id) {
            User.get({id: scope.user._id}, function(data){
              scope.user = data;
              scope.alertSave();
            }, function(err) {
              scope.alertError(err);
            });
          } else {
            scope.user = {
              name: '',
              email: '',
              password: '',
              role: 'user'
            };
          }

        };

        scope.allowedRoles = ['admin', 'user', 'guest'];

        // scope.setUserRole = function() {
        //   if (scope.user.selectedRole){
        //     User.changeRole({ id: scope.user._id }, { role: scope.user.selectedRole },
        //       angular.forEach(scope.users, function(u, i) {
        //         if (u === scope.user) {
        //           scope.users[i].role=scope.user.selectedRole;
        //           delete scope.user.selectedRole;
        //         }
        //       })
        //     );
        //   }
        // };

        // scope.selectUserRole = function(user, role) {
        //   scope.user.selectedRole = role;
        //   if (scope.user.role !== scope.user.selectedRole) {
        //     (Modal.confirm.edit(scope.setUserRole))(scope.user.name);
        //   }
        // };

        scope.confirmUserDelete = Modal.confirm.delete(scope.deleteUser);

        scope.editUser = function() {
          var u = {
            name : scope.user.name,
            email : scope.user.email,
            role : scope.user.role,
            canSeeClients : scope.user.canSeeClients
          };
          User.update({ id : scope.user._id }, u,
            function(data) {
              scope.alertSave(data);
            },
            function(err) {
              scope.alertError(err);
            });
        };

        scope.labelClass = function(role) {
          return {
            guest : 'default',
            admin : 'success',
            user : 'primary'
          }[role];
        };

        scope._clientById = [];
        scope.clientById = function(clientId) {
          if (!scope._clientById[clientId]) {
            angular.forEach(scope.clients, function(client){
              scope._clientById[client._id] = client.name;
            });
          }
          return scope._clientById[clientId];
        };

        scope.addRemoveClients = [];
        scope.addCanSeeClients = function(addRemoveClients) {
          angular.forEach(addRemoveClients, function(clientId) {
            if (scope.user.canSeeClients.indexOf(clientId) === -1){
              scope.user.canSeeClients.push(clientId);
            }
          });
        };

        scope.removeCanSeeClients = function(addRemoveClients) {
          angular.forEach(scope.user.canSeeClients, function(clientId, i) {
            if (addRemoveClients.indexOf(clientId) !== -1) {
              scope.user.canSeeClients.splice(i, 1);
            }
          });
        };

        // function alertSave(data) {
        //   //$log.log(data);
        // }
        // function alertError(err) {
        //   $log.log(err);
        // }

      }
    };
  });
