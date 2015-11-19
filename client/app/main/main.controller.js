'use strict';

angular.module('vcrawlerApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.prevCrawled = [];
    $scope.crawlResult = [];
    $scope.domain = '';
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
      $http.post('/api/things', { name: $scope.domain });
      $scope.domain = '';
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
    $scope.startCrawl = function(domain) {
      $scope.fetching = true;
      console.log("1" + domain);
      $scope.addThing();
      $http.post('/api/crawl/', {name: domain})
        .then(function(success) {
          $scope.fetching = false;
          $scope.badRequest = false;
          $scope.crawlResult = success.data.output;
          console.log($scope.crawlResult);
          console.log(success);
        }, function(error) {
          $scope.fetching = false;
          $scope.badRequest = true;
        }
      );
    }

  });
