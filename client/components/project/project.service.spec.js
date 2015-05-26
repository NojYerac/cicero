'use strict';

describe('Service: project', function () {

  // load the service's module
  beforeEach(module('ciceroApp'));

  // instantiate service
  var project;
  beforeEach(inject(function (_Project_) {
    project = _Project_;
  }));

  it('should do something', function () {
    expect(!!project).toBe(true);
  });

});
