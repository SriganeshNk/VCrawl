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
var distCrawler = 'localhost:3000';
var request = require('request');

// Get list of things
exports.index = function(req, res) {
  Thing.find(function (err, things) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(things);
  });
};

exports.show = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.crawl = function(req, res) {
  console.log("SRIGANESH:" + req.body.name);
  request(req.body.name, function(err, response, body){
    if(!err && response.statusCode == 200){
      // Now call the distCrawler get the output and pass it like below
      console.log("Input is correct");
      res.status(200).json({
        'output': [{
          'url': 'sample',
          'csp': 'OK',
          'https': 'OK',
          'xss': 'OK',
          'xframe': 'OK',
          'csrf' : 'OK'
        }]});
    }
    else {
      res.status(400).json({'output': ['NOT OK']});
    }
  })
};
