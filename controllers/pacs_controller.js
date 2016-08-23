"use strict";

var debug = require('debug')('controllers:users_controller:' + process.pid),
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

  return models.Pac.findOne({
    attributes: [
      'id',
      'name',
      'description',
      'color',
      'twitterUsername',
      'isDeleted',
      'deletedAt',
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
    req.pac = obj;
    next();
  });
}

function updatePac(req, res, next) {
  debug("updatePac");
  load(req)
  .then(function(pac, err) {
    pac.name = req.body.pac.name
    pac.description = req.body.pac.description
    pac.color = req.body.pac.color
    pac.twitterUsername = req.body.pac.twitterUsername
    pac.updatedAt = Date.now() / 1000
    pac.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingPac) {
      next();
    })
  })
  .catch(function(error, pac) {
    return next(new SequelizeError("422", {message: err}));
  });
}

function createPac(req, res, next) {
  var newPac = models.Pac.build({
    name: req.body.pac.name,
    description: req.body.pac.description,
    color: req.body.pac.color,
    twitterUsername: req.body.pac.twitterUsername,
    updatedAt: Date.now() / 1000
  })
  newPac.save(function(err) {
    if (err) { throw err; }
  }).then(function(newPac) {
    req.pac = newPac;
    next();
  })
}

function getAllPacs(req, res, next) {
  debug("getAllPacs");
  models.Pac.findAll({
    attributes: [
      'id',
      'name',
      'description',
      'color',
      'twitterUsername',
      'isDeleted',
      'deletedAt',
      'createdAt',
      'updatedAt'
    ],
    offset: 0,
    limit: 200, // NOTE will need to update if we get tons of pacs.
    order: '"updatedAt" DESC'
  }).then(function(objects, err) {
    req.pacs = objects;
    next()
  });
}

module.exports = function() {
  var router = new Router();

  router.route("/pacs")
  .get(getAllPacs, function(req, res, next) {
    debug("in GET-INDEX /pacs");
    return res.status(200).json(req.pacs);
  })
  .post(Authorize.role("admin"), createPac, function(req, res, next) {
    debug('in POST-CREATE /pacs');
    return res.status(201);
  });


  router.route("/pacs/:id")
  .get(fetch, function(req, res, next) {
    debug('in GET-SHOW /pacs/:id');
    debug("pacId: %s", req.params['id']);
    return res.status(200).json(req.pac);
  })
  .put(Authorize.role("admin"), updatePac, function(req, res, next) {
    debug('in PUT-UPDATE /pacs/:id');
    debug("pacId: %s",req.params['id'])
    return res.status(204);
  });

  return router;
}
