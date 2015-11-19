'use strict';

var express = require('express');
var controller = require('./crawl.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.crawl);

module.exports = router;
