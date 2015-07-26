'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: MyCtrl1});
      $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: MyCtrl2});
      $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: Login});
      $routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: Dashboard});
      $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
