'use strict';

angular.module('ciceroApp')
  .factory('Client', function ($resource) {
    return $resource(
      '/api/clients/:id/:controller',
      { id : '@id' },
      {
        update : {
          method : 'PATCH'
        }
      }
    )
  });
