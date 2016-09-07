"use strict";

const debug = require('debug')('controllers:pac_events_controller:' + process.pid),
    path = require('path'),
    Router = require("express").Router,
    models = require('../models/index.js'),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    Authorize = require("../services/Authorize.js"),
    attributesToLoad = [
      'id',
      'support',
      'eventId',
      'pacId',
      'createdAt',
      'updatedAt'];

function load(req) {
  const id = req.params.id;
  debug("id: %s", id);
  const eventId = req.params.eventId;
  debug("eventId: %s", eventId);

  return models.PacEvent.findOne({
    attributes: attributesToLoad,
    where: { eventId: eventId, id: id }
  });
}

function fetch(req, res, next) {
  debug("fetch");
  load(req)
  .then(function(obj, err) {
    debug(obj);
    req.pacEvent = obj;
    next();
  });
}

function deletePacEvent(req, res, next) {
  debug("deletePacEvent");
  load(req)
  .then(function(pacEvent, err) {
    pacEvent.deletedAt = Date.now() / 1000;
    pacEvent.destroy(function(err) {
      if (err) { throw err; }
    }).then(function() {
      next();
    });
  })
  .catch(function(error, pacEvent) {
    return next(new SequelizeError("422", {message: error}));
  });
}

function updatePacEvent(req, res, next) {
  debug("updatePacEvent");
  load(req)
  .then(function(pacEvent, err) {
    pacEvent.support = req.body.pacEvent.support;
    pacEvent.eventId = req.body.pacEvent.eventId;
    pacEvent.pacId = req.body.pacEvent.pacId;
    pacEvent.updatedAt = Date.now() / 1000;
    pacEvent.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingPacEvent) {
      next();
    });
  })
  .catch(function(error, pacEvent) {
    return next(new SequelizeError("422", {message: error}));
  });
}

function createPacEvent(req, res, next) {
  debug("createPacEvent");
  const newPacEvent  = models.PacEvent.build({
    support: req.body.pacEvent.support,
    eventId: req.body.pacEvent.eventId,
    pacId: req.body.pacEvent.pacId,
    updatedAt: Date.now() / 1000
  });
  newPacEvent.save(function(err) {
    if (err) { throw err; }
  }).then(function(newPacEvent) {
    req.pacEvent = newPacEvent;
    next();
  });
}

function getAllPacEvents(req, res, next) {
  debug("getAllPacEvents");
  const eventId      = req.params.eventId,
        supportParam = req.query.support,
        includePacsParam  = req.query.include_pacs;

  var whereQuery = {eventId: eventId};
  if (supportParam !== undefined) {
    whereQuery.support = supportParam
  }

  var doesInclude = [];
  if (includePacsParam !== undefined && includePacsParam === 'true') {
    doesInclude = [{ model: models.Pac }]; // , attributes: pacIncludeAttributes
  }

  models.PacEvent.findAll({
    attributes: attributesToLoad,
    where: whereQuery,
    include: doesInclude,
    offset: 0,
    limit: 50,
    order: '"updatedAt" DESC'
  }).then(function(objects, err) {
    req.pacEvents = objects;
    next();
  });
}

module.exports = function() {
  const router = new Router();

  router.route("/events/:eventId/pac_events")
  .get(Authorize.role("noAuth"), getAllPacEvents, function(req, res, next) {
    debug("in GET-INDEX /events/:eventId/pac_events");
    return res.status(200).json(req.pacEvents);
  })
  .post(Authorize.role("admin"), createPacEvent, function(req, res, next) {
    debug('in POST-CREATE /events/:eventId/pac_events');
    return res.status(201);
  });


  router.route("/events/:eventId/pac_events/:id")
  .get(Authorize.role("admin"), fetch, function(req, res, next) {
    debug('in GET-SHOW /events/:eventId/pac_events/:id');
    debug("pacEventId: %s", req.params.id);
    return res.status(200).json(req.pacEvent);
  })
  .put(Authorize.role("admin"), updatePacEvent, function(req, res, next) {
    debug('in PUT-UPDATE /events/:eventId/pac_events/:id');
    debug("pacEventId: %s",req.params.id);
    return res.status(204);
  })
  .delete(Authorize.role("admin"), deletePacEvent, function(req, res, next) {
    debug('in DELETE-DESTROY /events/:eventId/pac_events/:id');
    debug("pacEventId: %s",req.params.id);
    return res.status(204);
  });

  return router;
};
