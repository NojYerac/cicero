'use strict';

angular.module('ciceroApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      changeRole: {
        method: 'PATCH',
        params: {
          controller: 'role'
        }
      },
      getCSRFToken: {
        method: 'GET',
        params: {
          id: 'csrf'
        }
      }
	  });
  });
