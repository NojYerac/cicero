'use strict';

angular.module('ciceroApp')
  .directive('clientEdit', function ($log, Client, Modal) {
    return {
      templateUrl: 'components/clientEdit/clientEdit.html',
      scope : {
        client: '=client',
        clients: '=clients',
        alertError: '=alertError',
        alertSave: '=alertSave'
      },
      restrict: 'EA',
      link: function (scope) /*(scope, element, attrs)*/ {
        scope.newClient = !(scope.client && scope.client._id);

        scope.getContactTypeIcon = function(type) {
          return {
            email : 'envelope',
            address : 'map-marker',
            phone : 'phone'
          }[type] || '';
        };

        scope.autoExpand = function(e) {
          if (!e) {
            var element =
              typeof e === 'object' ? e.target : document.getElementById(e);
            var scrollHeight = element.scrollHeight + 2;
            element.style.height =  scrollHeight + 'px';
          } else {
            var elements = document.getElementsByClassName('auto-expand');
            angular.forEach(elements, function(el) {
              scope.autoExpand(el);
            });
            return;
          }
        };

        scope.getClientPrefix = function() {
          if (scope.newClient && scope.client.name) {
            scope.client.prefix=scope.client.name.replace(/\s+/, '').toUpperCase().slice(0,5);
          }
        };

        scope.resetClient = function() {
          if (scope.client._id) {
            Client.get({id: scope.client._id}, function(data){
              scope.client = data;
            }, function(err) {
              scope.alertError(err);
            });
          } else {
            scope.client = {
              name : '',
              prefix : '',
              rate : '',
              active : true,
              contact : [
                { type : 'email', label : 'Primary', value : '' },
                { type : 'address', label : 'Primary', value : '' },
                { type : 'phone', label : 'Primary', value : '' }
              ],
            };
          }
        };

        scope.deleteClient = function(){
          Client.remove({ id: scope.client._id },
          function(){
            angular.forEach(scope.clients, function(c, i) {
              if (c._id===scope.client._id) {
                scope.clients.splice(i, 1);
              }
            });
            scope.alertSave();
          }, function(err){
            scope.alertError(err);
          });
        };

        scope.confirmClientDelete = Modal.confirm.delete(scope.deleteClient);

        scope.editClient = function() {
          Client.update({id: scope.client._id}, scope.client, function(data) {
            //$log.log('editClient data => ' + data);
            scope.alertSave(data);
          }, function(err) {
            scope.alertError(err);
          });
        };

        scope.createClient = function() {
          Client.save(scope.client, function(data) {
            scope.clients.push(data);
            scope.resetClient();
            scope.alertSave();
          }, function(err) {
            scope.alertError(err);
          });
        };

        scope.addContactMethod = function() {
          scope.client.contact.push(
            {type : 'phone', label : 'Mobile', value : ''}
          );
        };

        scope.removeContact = function(delContact) {
          angular.forEach(scope.client.contact, function(contact, i) {
            if (delContact === contact) {
              scope.client.contact.splice(i, 1);
            }
          });
        };

      }
    };
  });
