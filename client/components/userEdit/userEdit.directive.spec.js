'use strict';
/*
global jasmine
 */

describe('Directive: userEdit', function () {

  // load the directive's module and view
  beforeEach(module('ciceroApp'));
  beforeEach(module('components/userEdit/userEdit.html'));

  var scope, element, isolated;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.user = {
      name : '',
      email: 'test@test.com',
      provider: 'local',
      canSeeClients: [],
      csrfTokens: [],
      isOpen : false,
    };
    scope.users = [scope.user];
    var accordion = angular.element('<accordion><user-edit user="user" users="users"></user-edit></accordion>');
    accordion = $compile(accordion)(scope);
    scope.$digest();
    element = accordion.find('user-edit');
    isolated = element.isolateScope();
  }));

  it('should add users to its isolated scope', inject(function () {
    expect(isolated.users).toBeDefined();
    expect(isolated.users).toEqual(jasmine.any(Array));
  }));

  it('should add user to its isolated scope', function(){
    expect(isolated.user).toBeDefined();
    expect(isolated.user).toEqual(jasmine.any(Object));
  });

  it('should include user in users', function(){
    expect(isolated.users).toContain(isolated.user);
  });

});
