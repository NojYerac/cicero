'use strict';

describe('Controller: AdminCtrl', function () {

  // load the controller's module
  beforeEach(module('ciceroApp'));
  beforeEach(module('socketMock'));

  var AdminCtrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/users')
      .respond(
        '[' +
          '{"_id":"5510d055111eb72e78edcad5","provider":"local",' +
          '"name":"Test User","email":"test@test.com","__v":0,"role":"user"},' +
          '{"_id":"5510d055111eb72e78edcad6","provider":"local",' +
          '"name":"Admin","email":"admin@admin.com","__v":0,"role":"admin"}' +
        ']'
      );

    scope = $rootScope.$new();
    AdminCtrl = $controller('AdminCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of users to the scope', function () {
    $httpBackend.flush();
    expect(scope.users.length).toBe(2);
  });

  it('should create a delete function', function() {
    $httpBackend.flush();
    expect(typeof scope.delete).toBe('function');
  });

  describe('Controller: AdminCtrl: delete', function() {
    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/api/users')
        .respond(
          '[' +
            '{"_id":"5510d055111eb72e78edcad5","provider":"local",' +
            '"name":"Test User","email":"test@test.com","__v":0,"role":"user"},' +
            '{"_id":"5510d055111eb72e78edcad6","provider":"local",' +
            '"name":"Admin","email":"admin@admin.com","__v":0,"role":"admin"}' +
          ']'
        );

      scope = $rootScope.$new();
      AdminCtrl = $controller('AdminCtrl', {
        $scope: scope
      });
      $httpBackend.flush();

      scope.delete(scope.users[0]);
      $httpBackend.expectGET('/api/users/csrf')
        .respond('{"token":"0987654321abcdef0987654321abcdef"}')
      $httpBackend.expectDELETE('/api/users/5510d055111eb72e78edcad5')
        .respond(204);
    }));

    it('should remove a user from the scope', function(){
      $httpBackend.flush();
      expect(scope.users.length).toBe(1)
    });
  });

  it('should create a setUserRole function', function(){
    $httpBackend.flush();
    expect(typeof scope.setUserRole).toBe('function');
  });


  describe('Controller: AdminCtrl: setUserRole', function(){
    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/api/users')
        .respond(
          '[' +
            '{"_id":"5510d055111eb72e78edcad5","provider":"local",' +
            '"name":"Test User","email":"test@test.com","__v":0,"role":"user"},' +
            '{"_id":"5510d055111eb72e78edcad6","provider":"local",' +
            '"name":"Admin","email":"admin@admin.com","__v":0,"role":"admin"}' +
          ']'
        );

      scope = $rootScope.$new();
      AdminCtrl = $controller('AdminCtrl', {
        $scope: scope
      });
      $httpBackend.flush();

      scope.users[0].selectedRole = 'admin';

      scope.setUserRole(scope.users[0]);
      $httpBackend.expectPATCH('/api/users/5510d055111eb72e78edcad5/role',
        '{"role":"admin"}')
        .respond(
          '{"_id":"5510d055111eb72e78edcad5","provider":"local",' +
          '"name":"Test User","email":"test@test.com","__v":0,"role":"admin"}'
        );
    }));

    it('should change the user\'s role', function(){
      //$httpBackend.flush();
      expect(scope.users[0].role).toBe('admin');
    });
  });

  it('should create a labelClass function', function(){
    $httpBackend.flush();
    expect(typeof scope.labelClass).toBe('function');
  });

  describe('Controller: AdminCtrl: labelClass', function(){
    beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('/api/users')
        .respond(
          '[' +
            '{"_id":"5510d055111eb72e78edcad5","provider":"local",' +
            '"name":"Test User","email":"test@test.com","__v":0,"role":"user"},' +
            '{"_id":"5510d055111eb72e78edcad6","provider":"local",' +
            '"name":"Admin","email":"admin@admin.com","__v":0,"role":"admin"}' +
          ']'
        );

      scope = $rootScope.$new();
      AdminCtrl = $controller('AdminCtrl', {
        $scope: scope
      });
      $httpBackend.flush( );

    }));

    it('shold return "success" for "admin" and "primary" for "user"', function(){
      //user role
      expect(scope.labelClass(scope.users[0].role)).toBe('primary');
      //admin admin
      expect(scope.labelClass(scope.users[1].role)).toBe('success');
    });
  });

});
