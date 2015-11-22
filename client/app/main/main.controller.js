'use strict';

angular.module('vcrawlerApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.prevCrawled = [];
    $scope.crawlResult = [];
    $scope.domain = '';
    $scope.pages = null ;
    $scope.vhttp = 'http';
    $scope.badRequest = false;
    $scope.fetching = false;
    // Here get the previously crawled domains... from the database
    $http.get('/api/things').success(function(prevCrawled) {
      $scope.prevCrawled = prevCrawled;
      socket.syncUpdates('thing', $scope.prevCrawled);
    });

    // Add new crawls into the database
    $scope.addThing = function() {
      if($scope.domain === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.domain, pages: $scope.pages, protocol: $scope.vhttp, response: null});
    };

    $scope.updateThing = function(data){
      $http.post('/api/things/update',{name:$scope.domain, pages: $scope.pages, protocol: $scope.vhttp, response: data});
      $scope.domain = '';
      $scope.pages = null;
      $scope.vhttp = "http";
    };

    // Delete entries from the database
    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    // Don't know why this is there!
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });

    //Start crawling the domain
    $scope.startCrawl = function(domain, pages) {
      $scope.fetching = true;
      console.log($scope.vhttp);
      domain = $scope.vhttp + "://" + domain;
      console.log("1" + domain);
      $scope.addThing();
      $http.post('/api/crawl/', {name: domain, pages: pages})
        .then(function(success) {
          $scope.fetching = false;
          $scope.badRequest = false;
          $scope.crawlResult = success.data.output;
          $scope.updateThing(success.data);
          console.log(success);
        }, function(error) {
          $scope.fetching = false;
          $scope.badRequest = true;
        }
      );
    };

    $scope.showResult = function(item) {
      console.log("ShowResult called:" + item);
      $scope.crawlResult = [];
      $scope.crawlResult = item.response.output;
    }

  });
