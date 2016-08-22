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
    offset: 1,
    limit: 2, // NOTE make 10?
    order: '"id" DESC'
  }).then(function(objects, err) {
    req.pacs = objects;
    next()
  });
}

module.exports = function() {
  var router = new Router();

  router.route("/pacs")
  .get(getAllPacs, function(req, res, next) {
    debug("in /pacs");
    return res.status(200).json(req.pacs);
  })

  // TODO add post stuff
  // .post();

  router.route("/pacs/:id")
  .get(fetch, function(req, res, next) {
    debug('in GET /pacs/:id');
    debug("pacId: %s", req.params['id']);
    return res.status(200).json(req.pac);
  })
  .put(Authorize.role("admin"), function(req, res, next) {
    // used to be a POST to /v1/update-profile
    updatePac(req, res, next);
    debug('in PUT /pacs/:id');
    debug("pacId: %s",req.params['id'])
    return res.status(204);
  });

  return router;
}
