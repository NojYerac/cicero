'use strict';

angular.module('ciceroApp')
  .factory('project', function ($resource) {
    return $resource(
      '/api/projects/:id/:controller',
      { id : '@id' },
      {}
    );
  });
