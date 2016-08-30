"use strict";

const debug = require('debug')('controllers:politician_photos_controller:' + process.pid),
    path = require('path'),
    Router = require("express").Router,
    models = require('../models/index.js'),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    Authorize = require("../services/Authorize.js"),
    attributesToLoad = [
      'id',
      'politicianId',
      'url',
      'main',
      'createdAt',
      'updatedAt'];

function load(req) {
  const id = req.params.id;
  debug("id: %s", id);
  const politicianId = req.params.politicianId;
  debug("politicianId: %s", politicianId);

  return models.PoliticianPhoto.findOne({
    attributes: attributesToLoad,
    where: { politicianId: politicianId, id: id }
  });
}

function fetch(req, res, next) {
  debug("fetch");
  load(req)
  .then(function(obj, err) {
    debug(obj);
    req.politicianPhoto = obj;
    next();
  });
}

function deletePoliticianPhoto(req, res, next) {
  debug("deletePoliticianPhoto");
  load(req)
  .then(function(politicianPhoto, err) {
    politicianPhoto.deletedAt = Date.now() / 1000;
    politicianPhoto.destroy(function(err) {
      if (err) { throw err; }
    }).then(function() {
      next();
    });
  })
  .catch(function(error, politicianPhoto) {
    return next(new SequelizeError("422", { message: error }));
  });
}

function updatePoliticianPhoto(req, res, next) {
  debug("updatePoliticianPhoto");
  load(req)
  .then(function(politicianPhoto, err) {
    politicianPhoto.politicianId = req.body.politicianPhoto.politicianId;
    politicianPhoto.url = req.body.politicianPhoto.url;
    politicianPhoto.main = req.body.politicianPhoto.main;
    politicianPhoto.updatedAt = Date.now() / 1000;
    politicianPhoto.save(function(err) {
      if (err) { throw err; }
    }).then(function(existingPoliticianPhoto) {
      next();
    });
  })
  .catch(function(error, politicianPhoto) {
    return next(new SequelizeError("422", {message: error}));
  });
}

function createPoliticianPhoto(req, res, next) {
  debug("createPoliticianPhoto");
  const newPoliticianPhoto  = models.PoliticianPhoto.build({
    politicianId: req.body.politicianPhoto.politicianId,
    url: req.body.politicianPhoto.url,
    main: req.body.politicianPhoto.main,
    updatedAt: Date.now() / 1000
  });
  newPoliticianPhoto.save(function(err) {
    if (err) { throw err; }
  }).then(function(newPoliticianPhoto) {
    req.politicianPhoto = newPoliticianPhoto;
    next();
  });
}

function getAllPoliticianPhotos(req, res, next) {
  debug("getAllPoliticianPhotos");
  const politicianId = req.params.politicianId;
  debug("politicianId: %s", politicianId);

  models.PoliticianPhoto.findAll({
    attributes: attributesToLoad,
    where: { politicianId: politicianId },
    offset: 0,
    limit: 50,
    order: '"updatedAt" DESC'
  }).then(function(objects, err) {
    req.politicianPhotos = objects;
    next();
  });
}

module.exports = function() {
  const router = new Router();

  router.route("/politicians/:politicianId/politician_photos")
  .get(Authorize.role("admin"), getAllPoliticianPhotos, function(req, res, next) {
    debug("in GET-INDEX /politicians/:politicianId/politician_photos");
    return res.status(200).json(req.politicianPhotos);
  })
  .post(Authorize.role("admin"), createPoliticianPhoto, function(req, res, next) {
    debug('in POST-CREATE /politicians/:politicianId/politician_photos');
    return res.status(201);
  });


  router.route("/politicians/:politicianId/politician_photos/:id")
  .get(Authorize.role("admin"), fetch, function(req, res, next) {
    debug('in GET-SHOW /politicians/:politicianId/politician_photos/:id');
    debug("politicianPhotoId: %s", req.params.id);
    return res.status(200).json(req.politicianPhoto);
  })
  .put(Authorize.role("admin"), updatePoliticianPhoto, function(req, res, next) {
    debug('in PUT-UPDATE /politicians/:politicianId/politician_photos/:id');
    debug("politicianPhotoId: %s",req.params.id);
    return res.status(204);
  })
  .delete(Authorize.role("admin"), deletePoliticianPhoto, function(req, res, next) {
    debug('in DELETE-DESTROY /politicians/:politicianId/politician_photos/:id');
    debug("politicianPhotoId: %s",req.params.id);
    return res.status(204);
  });

  return router;
};
