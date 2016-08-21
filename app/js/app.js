'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', function($routeProvider) {
      $routeProvider
          .when('/', {
              templateUrl: 'main.html',
              controller: ImagesCtrl
          })
          .when('/signup', {
              templateUrl: '/account/signup',
              controller: Signup
          })
          .otherwise({
              redirectTo: '/'
          });
    }]).
    constant("EVENTS", {
        IMAGES_RESIZED : "imagesResized"
    }).
    run(function ($rootScope, EVENTS) {
        // register it under $rootScope so that it can be shared by different controller.
        $rootScope.EVENTS = EVENTS;
    });



