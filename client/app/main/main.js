'use strict';

angular.module('vcrawlerApp')
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  });
