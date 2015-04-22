'use strict';

angular.module('ciceroApp')
  .factory('Project', function ($resource) {
    return $resource(
      '/api/projects/:id/:controller',
      { id : '@id' },
      {
        update : {
          method : 'PATCH'
        }
      }
    );
  });
