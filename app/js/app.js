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
  }]);



