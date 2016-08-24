"use strict";

var debug = require('debug')('controllers:events_controller:' + process.pid),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    async = require("async"),
    Router = require("express").Router,
    models = require('../models/index.js'),
    utils = require("../services/tokenUtils.js"),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    Authorize = require("../services/Authorize.js"),
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js"));


function load(req) {
  var id = req.params['id'] || req.body.eventId;
  debug("id: %s", id);

  return models.Event.findOne({
    attributes: [
      'id',
      'isPinned',
      'imageUrl',
      'imageAttribution',
      'politicianId',
      'headline',
      'summary',
      'createdAt',
      'updatedAt'
    ],
    where: { id: id }
  })
}

function unPinEvent(req, res, next) {
  // NOTE should only be one, but let's just safe
  var pinnedEvents = models.Event.findOne({
    attributes: [
      'id',
      'isPinned',
      'imageUrl',
      'imageAttribution',
      'politicianId',
      'headline',
      'summary',
      'createdAt',
      'updatedAt'
    ],
    where: { isPinned: true }
  })
  .then(function(pinnedEvent, err) {
    debug("in pinnedEvents");
    if (pinnedEvent) {
      pinnedEvent.isPinned = false;
      pinnedEvent.save(function(err) {
        if (err) {
          throw err;
        }
      }).then(function(existingUser) {
        next();
      });
    } else {
      next();
    }
  })
}

function pinEvent(req, res, next) {
  debug("pinEvent");
  load(req)
  .then(function(event, err) {
    event.isPinned = true

    event.updatedAt = Date.now() / 1000
    event.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingEvent) {
      req.event = existingEvent;
      return next();
    })
  })
  .catch(function(error, event) {
    return next(new SequelizeError("422", {message: err}));
  });
}

function fetch(req, res, next) {
  debug("fetch");
  load(req)
  .then(function(obj, err) {
    // debug(obj);
    req.event = obj;
    next();
  });
}

function updateEvent(req, res, next) {
  debug("updateEvent");
  load(req)
  .then(function(event, err) {
    event.isPinned = req.body.event.isPinned
    event.imageUrl = req.body.event.imageUrl
    event.imageAttribution = req.body.event.imageAttribution
    event.politicianId = req.body.event.politicianId
    event.headline = req.body.event.headline
    event.summary = req.body.event.summary

    event.updatedAt = Date.now() / 1000
    event.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingEvent) {
      next();
    })
  })
  .catch(function(error, event) {
    return next(new SequelizeError("422", {message: err}));
  });
}

function createEvent(req, res, next) {
  debug("createEvent");
  var newEvent = models.Event.build({
    isPinned: req.body.event.isPinned,
    imageUrl: req.body.event.imageUrl,
    imageAttribution: req.body.event.imageAttribution,
    politicianId: req.body.event.politicianId,
    headline: req.body.event.headline,
    summary: req.body.event.summary,
    updatedAt: Date.now() / 1000
  })
  newEvent.save(function(err) {
    if (err) { throw err; }
  }).then(function(newEvent) {
    req.event = newEvent;
    next();
  })
}
function getAllEvents(req, res, next) {
  debug("getAllEvents");
  models.Event.findAll({
    attributes: [
      'id',
      'isPinned',
      'imageUrl',
      'imageAttribution',
      'politicianId',
      'headline',
      'summary',
      'createdAt',
      'updatedAt'
    ],
    offset: 0,
    limit: 5, // NOTE make 10?
    order: '"id" DESC'
  }).then(function(objects, err) {
    req.events = objects;
    next()
  });
}


module.exports = function() {
  var router = new Router();

  router.route("/events")
  .get(getAllEvents, function(req, res, next) {
    debug("in GET-INDEX /events");
    return res.status(200).json(req.events);
  })
  .post(Authorize.role("admin"), createEvent, function(req, res, next) {
    debug('in POST-CREATE /events');
    return res.status(201);
  });


  router.route("/events/:id")
  .get(fetch, function(req, res, next) {
    debug('in GET-SHOW /events/:id');
    debug("eventId: %s", req.params['id']);
    return res.status(200).send(req.event);
  })
  .put(Authorize.role("admin"), updateEvent, function(req, res, next) {
    debug('in PUT-UPDATE /events/:id');
    debug("eventId: %s",req.params['id'])
    return res.status(204);
  });

  router.route("/events/:id/pin")
  .put(Authorize.role("admin"), unPinEvent, pinEvent, function(req, res, next) {
    debug('in PUT-PIN /events/pin');
    return res.status(204).send(req.event);
  });

  return router;
}
