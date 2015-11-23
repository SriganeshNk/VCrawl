/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var distCrawler = 'http://130.245.130.190:5000/crawls';
//var distCrawler = "http://localhost:5000/api/crawls";
var request = require('request');

// Get list of things
exports.index = function(req, res) {
  return res.status(200).json({'hello': 'world'});
};

// Crawls the domain and checks for vulnerabilities.
exports.crawl = function(req, res) {
  console.log("SRIGANESH: " + req.body.name + req.body.pages);
  request(req.body.name, function(err, response, body){
    //console.log("RESPONSE:", response.statusCode);
    //console.log(distCrawler+req.body.pages+"/"+req.body.name);
    if(!err && !!response && response.statusCode == 200) {
      console.log("Input is correct");
      // Now call the distCrawler get the output
      request.post({url: distCrawler, form:{url:req.body.name, pages: req.body.pages}},
      /*request(distCrawler+req.body.pages+"/"+req.body.name+"/",*/ function (error, resp, result) {
        if(!error && !!resp && resp.statusCode == 200) {
          res.status(200).send(result);
        }
        else{
          res.status(resp.statusCode).json({'status': 'Server not responding properly'});
        }
      });
    }
    else {
      console.log("Input is not correct");
      res.status(response.statusCode).json({'output': ['NOT OK']});
    }
  });
};
