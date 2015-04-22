'use strict';

angular.module('ciceroApp')
  .directive('userEdit', function (User, Modal) {
    return {
      templateUrl: 'components/userEdit/userEdit.html',
      restrict: 'EA',
      scope : {
        user : '=user',
        users : '=users'
      },
      link: function (scope, element, attrs) {

        scope.newUser = !scope.user._id;

        scope.deleteUser = function() {
          User.getCSRFToken(function(res){
            User.remove({ id: scope.user._id, csrfToken: res.csrfToken });
            angular.forEach(scope.users, function(u, i) {
              if (u === scope.user) {
                scope.users.splice(i, 1);
              }
            });
          });
        };

        scope.createUser = function() {
          User.save(scope.user, function(data){
            scope.users.push(data);
            scope.resetUser();
          },function(err){
            console.log(err);
          });
        };

        scope.resetUser = function() {
          if (scope.user._id) {
            User.get({id: scope.user._id}, function(data){
              scope.user = data;
            }, function(err) {
              console.log(err);
            })
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
            role : scope.user.role
          };
          User.update({ id : scope.user._id }, u);
        };

        scope.labelClass = function(role) {
          return {
            guest : 'default',
            admin : 'success',
            user : 'primary'
          }[role]
        };

      }
    };
  });
