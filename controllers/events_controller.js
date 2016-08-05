"use strict";

var debug = require('debug')('controllers:events_controller:' + process.pid),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    async = require("async"),
    Router = require("express").Router,
    models = require('../models/index.js')




// will need to handle query param or way to get more events

function getAllEvents(req, res, next) {
  debug("getAllEvents");
  models.Event.findAll({
    attributes: ['id', 'isPinned', 'imageUrl', 'imageAttribution', 'politicianId', 'headline', 'summary', 'createdAt', 'updatedAt'],
    offset: 1,
    limit: 2, // NOTE make 10?
    order: '"id" DESC'
  }).then(function(events, err) {
    debug(events);
    req.events = events;
    next()
  });
}

module.exports = function() {
  var router = new Router();

  router.route("/events").get(getAllEvents, function(req, res, next) {
    debug("in /events");
    return res.status(200).json(req.events);
  });

  return router;
}
