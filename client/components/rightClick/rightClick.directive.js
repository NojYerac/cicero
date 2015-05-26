'use strict';

angular.module('ciceroApp')
  .directive('rightClick', function ($parse) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var fn = $parse(attrs.rightClick);
        element.addClass('right-click');
        element.bind('contextmenu', function(event) {
          scope.$apply(function() {
            event.preventDefault();
            fn(scope, {$event:event});
          });
        });
      }
    };
  });
