'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ThingSchema = new Schema({
  name: String,
  pages: Number,
  protocol: String,
  response: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Thing', ThingSchema);
