'use strict';

angular.module('ciceroApp')
  .factory('Time', function ($resource) {
    return $resource(
      '/api/times/:id/:controller',
      { id : '@id' },
      {}
    );
  });
