"use strict";

const debug = require('debug')('controllers:politicians_controller:' + process.pid),
    path = require('path'),
    Router = require("express").Router,
    models = require('../models/index.js'),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    Authorize = require("../services/Authorize.js"),
    attributesToLoad = [
      'id',
      'firstName',
      'lastName',
      'jobTitle',
      'color',
      'twitterUsername',
      'createdAt',
      'updatedAt'
    ];

function load(req) {
  const id = req.params.id;
  debug("id: %s", id);

  return models.Politician.findOne({
    attributes: attributesToLoad,
    where: { id: id }
  });
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
    politician.firstName = req.body.politician.firstName;
    politician.lastName = req.body.politician.lastName;
    politician.jobTitle = req.body.politician.jobTitle;
    politician.twitterUsername = req.body.politician.twitterUsername;
    politician.color = req.body.politician.color;

    politician.updatedAt = Date.now() / 1000;
    politician.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingPolitician) {
      next();
    });
  })
  .catch(function(error, politician) {
    return next(new SequelizeError("422", {message: error}));
  });
}

function createPolitician(req, res, next) {
  debug("createPolitician");
  const newPolitician = models.Politician.build({
    firstName:       req.body.politician.firstName,
    lastName:        req.body.politician.lastName,
    jobTitle:        req.body.politician.jobTitle,
    twitterUsername: req.body.politician.twitterUsername,
    color:           req.body.politician.color,
    updatedAt:       Date.now() / 1000
  });
  newPolitician.save(function(err) {
    if (err) { throw err; }
  }).then(function(newPolitician) {
    req.politician = newPolitician;
    next();
  });
}

function getAllPoliticians(req, res, next) {
  debug("getAllPoliticians");
  models.Politician.findAll({
    attributes: attributesToLoad,
    offset: 0,
    limit: 200, // NOTE will need to update if we get tons of politicians.
    order: '"lastName" ASC'
  }).then(function(objects, err) {
    req.politicians = objects;
    next();
  });
}

module.exports = function() {
  const router = new Router();

  router.route("/politicians")
  .get(Authorize.role("admin"), getAllPoliticians, function(req, res, next) {
    debug("in GET-INDEX /politicians");
    return res.status(200).json(req.politicians);
  })
  .post(Authorize.role("admin"), createPolitician, function(req, res, next) {
    debug('in POST-CREATE /politicians');
    return res.status(201);
  });

  router.route("/politicians/:id")
  .get(Authorize.role("admin"), fetch, function(req, res, next) {
    debug('in GET-SHOW /politicians/:id');
    debug("politicianId: %s", req.params.id);
    return res.status(200).json(req.politician);
  })
  .put(Authorize.role("admin"), updatePolitician, function(req, res, next) {
    debug('in PUT-UPDATE /politicians/:id');
    debug("politicianId: %s",req.params.id);
    return res.status(204);
  });

  return router;
};
