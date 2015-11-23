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
      $scope.charts = false;
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
      $scope.charts = false;
      $scope.crawlResult = [];
      $scope.crawlResult = item.response.output;
      $scope.chartReady = true;
      $scope.aggregate();
    };

    $scope.chartReady = false;
    $scope.charts = false;
    $scope.chartData = [[0, 0, 0, 0, 0]];
    $scope.chartSeries = ['Vulnerability'];
    $scope.chartLabels = ["CSP", "CSRF", "HSTS", "XFRAME", "XSS"];
    $scope.chartCSPLabels = ["base-uri", "child-src", "connect-src", "default-src", "font-src", "form-action", "frame-ancestors", "frame-src", "img-src", "media-src", "object-src", "plugin-types", "report-uri", "script-src", "style-src", "upgrade-insecure-requests"];
    $scope.chartCSPSeries = ['CSP Vulnerability'];
    $scope.chartCSPData = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
    $scope.chartHSTSData = [[0, 0]];
    $scope.chartHSTSLabels = ["includeSubDomains", "preload"];
    $scope.chartHSTSSeries = ['HSTS Vulnerability'];

    $scope.displayGraph = function(){
      if(!!$scope.chartSeries && !!$scope.chartData && !!$scope.chartLabels){
        $scope.charts = !$scope.charts;
      }
    };

    $scope.aggregate = function(){
      $scope.chartData = [[0, 0, 0, 0, 0]];
      $scope.chartCSPData = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
      $scope.chartHSTSData = [[0, 0]];
      $scope.crawlResult.forEach(function(item){
        $scope.chartData[0][0] = item.data.csp.implemented ? $scope.chartData[0][0]+1 : $scope.chartData[0][0];
        $scope.chartData[0][1] = item.data.csrf.implemented ? $scope.chartData[0][1]+1 : $scope.chartData[0][1];
        $scope.chartData[0][2] = item.data.hsts.implemented ? $scope.chartData[0][2]+1 : $scope.chartData[0][2];
        $scope.chartData[0][3] = item.data.xframe.implemented ? $scope.chartData[0][3]+1 : $scope.chartData[0][3];
        $scope.chartData[0][4] = item.data.xss.implemented ? $scope.chartData[0][4]+1 : $scope.chartData[0][4];
        $scope.getCSPAggregate(item);
        $scope.getHSTSAggregate(item);
      });
    };

    $scope.getCSPAggregate = function(item) {
      if(item.data.csp.implemented) {
        for(var i=0; i < $scope.chartCSPLabels.length; i++) {
          $scope.chartCSPData[0][i] = item.data.csp[$scope.chartCSPLabels[i]] ? $scope.chartCSPData[0][i]+1: $scope.chartCSPData[0][i];
        }
      }
    };

    $scope.getHSTSAggregate = function(item){
      if(item.data.hsts.implemented) {
        $scope.chartHSTSData[0][0] = item.data.hsts.includeSubDomains ? $scope.chartHSTSData[0][0]+1 : $scope.chartHSTSData[0][0];
        $scope.chartHSTSData[0][1] = item.data.hsts.preload ? $scope.chartHSTSData[0][1]+1 : $scope.chartHSTSData[0][1];
      }
    };
  });
