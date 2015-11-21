'use strict';

var express = require('express');
var controller = require('./crawl.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.crawl);

module.exports = router;
