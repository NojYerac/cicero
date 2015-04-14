'use strict';

describe('Service: Time', function () {

  // load the service's module
  beforeEach(module('ciceroApp'));

  // instantiate service
  var time;
  beforeEach(inject(function (_Time_) {
    time = _Time_;
  }));

  it('should do something', function () {
    expect(!!time).toBe(true);
  });

});
