'use strict';
/*
global jasmine, describe, before, after, beforeEach, afterEach, it
 */

describe('Directive: clientEdit', function () {
  before(inject(function(){

  }));
  // load the directive's module and view
  beforeEach(module('ciceroApp'));
  beforeEach(module('components/clientEdit/clientEdit.html'));

  var element, scope, isolated;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.client = {
      name : '',
      prefix : '',
      rate : '',
      active : true,
      isOpen : false,
      contact : [
        { type : 'email', label : 'Primary', value : '' },
        { type : 'address', label : 'Primary', value : '' },
        { type : 'phone', label : 'Primary', value : '' }
      ],
    };
    scope.clients = [scope.client];
    var accordion = angular.element('<accordion><client-edit client="client" clients="clients"></client-edit></accordion>');
    accordion = $compile(accordion)(scope);
    scope.$digest();
    element = accordion.find('client-edit');
    isolated = element.isolateScope();
  }));

  afterEach(inject(function(){

  }));

  after(inject(function(){

  }));

  it('should add clients to its isolated scope', inject(function () {
    expect(isolated.clients).toBeDefined();
    expect(isolated.clients).toEqual(jasmine.any(Array));
  }));

  it('should add client to its isolated scope', function(){
    expect(isolated.client).toBeDefined();
    expect(isolated.client).toEqual(jasmine.any(Object));
  });

  it('should include client in clients', function(){
    expect(isolated.clients).toContain(isolated.client);
  });





});
