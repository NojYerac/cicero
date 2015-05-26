'use strict';
/**
 * Resource provider for the Client object makes requests to
 * /api/clients/:id/:controller
 * @module Client
 *
 * @exports get, save, query, remove, delete, update
 */
/**
 * @method get
 * @param {Object} params
 */
/**
 * @method save
 * @param {Object} user
 * @param {Function} [success]  function called upon 204 response
 * @param {Function} [error]    function called upon non-204 response
 */
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
    );
  });
