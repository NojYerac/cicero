'use strict';

describe('Directive: userEdit', function () {

  // load the directive's module and view
  beforeEach(module('ciceroApp'));
  beforeEach(module('components/userEdit/userEdit.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<user-edit></user-edit>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the userEdit directive');
  }));
});