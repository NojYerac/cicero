'use strict';

describe('Service: Client', function () {

  // load the service's module
  beforeEach(module('ciceroApp'));

  // instantiate service
  var client;
  beforeEach(inject(function (_Client_) {
    client = _Client_;
  }));

  it('should do something', function () {
    expect(!!client).toBe(true);
  });

});
