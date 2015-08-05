'use strict';

angular.module('ciceroApp')
  .factory('Modal', function($rootScope, $modal, $log, Time) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass, templateUrl) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: templateUrl || 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {

      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete: function(del) {
          del = del || angular.noop;

          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed staight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              deleteModal;

            deleteModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Delete',
                html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function(e) {
                    deleteModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    deleteModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function(event) {
              del.apply(event, args);
            });
          };
        },

        /**
         * Create a function to open an edit confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} ed - callback, ran when edit is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        edit: function(ed) {
          ed = ed || angular.noop;

          /**
           * Open an edit confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed staight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              editModal;

            editModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Edit',
                html: '<p>Are you sure you want to edit <strong>' + name + '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-warning',
                  text: 'Edit',
                  click: function(e) {
                    editModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    editModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-warning');

            editModal.result.then(function(event) {
              ed.apply(event, args);
            });
          };
        }
      },
      edit: {
        /**
         * [time description]
         * @param  {[type]} ed [description]
         * @return {[type]}    [description]
         */
        time: function(ed) {
          ed = ed || angular.noop;
          /**
           * [description]
           * @param  {Object} time [description]
           * @param  {Array} users [description]
           * @param  {Array} clients [description]
           * @param  {Array} projects [description]
           * @param  {Array} args [description]
           * @param  {Event} e
           * @return {Promise}      [description]
           */
          return function() {
            var args = Array.prototype.slice.call(arguments);
            var e = args.pop();
            e.preventDefault();
            var time = args.shift();
            //$log.log(time);
            var users = args.shift();
            //$log.log(users);
            var clients = args.shift();
            //$log.log(clients);
            var projects = args.shift();
            //$log.log(projects);
            if (time.interval === undefined) {
              time.interval = function(newInterval) {
                if (arguments.length === 0) {
                  return new Date(time.endTime.getTime() - time.startTime.getTime());

                } else {
                  var i = (new Date(newInterval)).getTime();
                  time.endTime.setTime(time.startTime.getTime() + i);
                }
              };
            }
            var editModal;
            var modalScope = {
              // '$interval': function(deltaT){
              //   var i = new Date(deltaT);
              //
              // },
              time: time,
              users: users,
              clients: clients,
              projects: projects,
              modal: {
                dismissable: true,
                title: 'Edit Time',
                buttons: [{
                  text: 'Log',
                  click: function() {
                    $log.log(time.interval);
                  }
                }, {
                  classes: 'btn-primary',
                  text: 'Edit',
                  disabled: function() {
                    return !(time.userId && time.clientId && time.projectId);
                  },
                  click: function(e) {
                    editModal.close(modalScope.time, e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    modalScope.resetTime();
                    editModal.dismiss(e);
                  }
                }]
              },
              resetTime: function() {
                Time.get({
                  id: time._id
                }, function(data) {
                  angular.extend(time, {
                    userId: data.userId,
                    clientId: data.clientId,
                    projectId: data.projectId,
                    startTime: new Date(data.startTime),
                    endTime: new Date(data.endTime)
                  });
                }, function(err) {
                  $log.log(err);
                });
              }
            };


            // if (args[0] && args[0].buttons) {
            //   angular.forEach(args[0].buttons,
            //     function(button){
            //       if (button.click) {
            //         button.click.bind(editModal);
            //       }
            //       modalScope.modal.buttons.unshift(button);
            //     });
            // }

            editModal = openModal(
              modalScope,
              'modal-primary', //class
              'components/modal/editTime.html'); //templateUrl

            editModal.result.then(function(time, args) {
              $log.log(time);
              ed.apply(time, time, args);
            });
          };
        }
      }
    };
  });
