'use strict';

angular.module('ciceroApp')
  .factory('Client', function ($resource) {
    return $resource(
      '/api/clients/:id/:controller',
      { id : '@id' },
      {}
    )
    // AngularJS will instantiate a singleton by calling "new" on this function
  });
