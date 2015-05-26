'use strict';

describe('Directive: rightClick', function () {

  // load the directive's module
  beforeEach(module('ciceroApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    scope.event={};
    scope.test = function(event) { scope.event=event; };
    element = angular.element('<a right-click="test($event)"></a>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('');
  }));
});
