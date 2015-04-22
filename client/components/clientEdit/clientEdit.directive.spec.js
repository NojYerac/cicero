'use strict';

describe('Directive: clientEdit', function () {

  // load the directive's module and view
  beforeEach(module('ciceroApp'));
  beforeEach(module('components/clientEdit/clientEdit.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<client-edit></client-edit>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the clientEdit directive');
  }));
});