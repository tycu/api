"use strict";

var debug = require('debug')('controllers:politicians_controller:' + process.pid),
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
  var id = req.params['id'];
  debug("id: %s", id);

  return models.Politician.findOne({
    attributes: [
      'id',
      'thumbnail',
      'firstName',
      'lastName',
      'jobTitle',
      'twitterUsername',
      'createdAt',
      'updatedAt'
    ],
    where: { id: id }
  })
}

function fetch(req, res, next) {
  debug("fetch");
  load(req)
  .then(function(obj, err) {
    debug(obj);
    req.politician = obj;
    next();
  });
}

function updatePolitician(req, res, next) {
  debug("updatePolitician");
  load(req)
  .then(function(politician, err) {
    politician.thumbnail = req.body.politician.thumbnail
    politician.firstName = req.body.politician.firstName
    politician.lastName = req.body.politician.lastName
    politician.jobTitle = req.body.politician.jobTitle
    politician.twitterUsername = req.body.politician.twitterUsername

    politician.updatedAt = Date.now() / 1000
    politician.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingPolitician) {
      next();
    })
  })
  .catch(function(error, politician) {
    return next(new SequelizeError("422", {message: err}));
  });
}

function createPolitician(req, res, next) {
  debug("createPolitician");
  var newPolitician = models.Politician.build({
    thumbnail: req.body.politician.thumbnail,
    firstName: req.body.politician.firstName,
    lastName: req.body.politician.lastName,
    jobTitle: req.body.politician.jobTitle,
    twitterUsername: req.body.politician.twitterUsername,
    updatedAt: Date.now() / 1000
  })
  newPolitician.save(function(err) {
    if (err) { throw err; }
  }).then(function(newPolitician) {
    req.politician = newPolitician;
    next();
  })
}

function getAllPoliticians(req, res, next) {
  debug("getAllPoliticians");
  models.Politician.findAll({
    attributes: [
      'id',
      'thumbnail',
      'firstName',
      'lastName',
      'jobTitle',
      'twitterUsername',
      'createdAt',
      'updatedAt'
    ],
    offset: 0,
    limit: 200, // NOTE will need to update if we get tons of politicians.
    order: '"updatedAt" DESC'
  }).then(function(objects, err) {
    req.politicians = objects;
    next()
  });
}

module.exports = function() {
  var router = new Router();

  router.route("/politicians")
  .get(getAllPoliticians, function(req, res, next) {
    debug("in GET-INDEX /politicians");
    return res.status(200).json(req.politicians);
  })
  .post(Authorize.role("admin"), createPolitician, function(req, res, next) {
    debug('in POST-CREATE /politicians');
    return res.status(201);
  });


  router.route("/politicians/:id")
  .get(fetch, function(req, res, next) {
    debug('in GET-SHOW /politicians/:id');
    debug("politicianId: %s", req.params['id']);
    return res.status(200).json(req.politician);
  })
  .put(Authorize.role("admin"), updatePolitician, function(req, res, next) {
    debug('in PUT-UPDATE /politicians/:id');
    debug("politicianId: %s",req.params['id'])
    return res.status(204);
  });

  return router;
}
