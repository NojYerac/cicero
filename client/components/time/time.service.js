'use strict';

angular.module('ciceroApp')
  .factory('Time', function ($resource) {
    return $resource(
      '/api/times/:id/:controller',
      { id : '@id' },
      {
        start : {
          method : 'POST',
          params : {}
        },
        latest : {
          method : 'GET',
          params : {
            id : 'latest'
          }
        },
        stop : {
          method : 'POST',
          params : {
            id : 'active',
            controller : 'stop'
          }
        },
        update : {
          method : 'PATCH',
        }
      }
    );
  });
