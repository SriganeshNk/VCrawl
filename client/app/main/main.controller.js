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
          $scope.chartReady = true;
          $scope.aggregate();
          //console.log(success);
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
      $scope.chartReady = true;
    };

    $scope.chartReady = false;
    $scope.charts = false;
    $scope.chartData = null;
    $scope.chartSeries = ['Vulnerability'];
    $scope.chartLabels = ["CSP", "CSRF", "HSTS", "XFRAME", "XSS"];
    $scope.chartCSPLabels = ["base-uri", "child-src", "connect-src", "default-src", "font-src", "form-action", "frame-ancestors", "frame-src", "img-src", "media-src", "object-src", "plugin-types", "report-uri", "script-src", "style-src", "upgrade-insecure-requests"];
    $scope.chartCSPData = null;

    $scope.displayGraph = function(){
      if(!!$scope.chartSeries && !!$scope.chartData && !!$scope.chartLabels){
        $scope.charts = !$scope.charts;
      }
    };

    $scope.aggregate = function(){
      $scope.chartData = [0, 0, 0, 0, 0];
      $scope.crawlResult.forEach(function(item){
        $scope.chartData[0] = item.data.csp.implemented ? vulCount[0]+1 : vulCount[0];
        $scope.chartData[1] = item.data.csrf.implemented ? vulCount[1]+1 : vulCount[1];
        $scope.chartData[2] = item.data.hsts.implemented ? vulCount[2]+1 : vulCount[2];
        $scope.chartData[3] = item.data.xframe.implemented ? vulCount[3]+1 : vulCount[3];
        $scope.chartData[4] = item.data.xss.implemented ? vulCount[4]+1 : vulCount[4];
      });
      $scope.getCSPAggregate();
    };

    $scope.getCSPAggregate = function() {

    };

  });
