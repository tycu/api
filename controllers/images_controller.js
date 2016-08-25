"use strict";

const path = require('path'),
      Router = require("express").Router,
      models = require('../models/index.js'),
      SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
      Authorize = require("../services/Authorize.js"),
      baseImageUrl = 'https://tally.imgix.net',
      uuid = require('uuid'),
      fileTypeExtensions = {
        'image/jpeg': '.jpg',
        'image/png': '.png'
      },
      env = process.env.NODE_ENV || "development",
      config = require("../config/GoogleCloudOptions.json")[env],
      envBucket = config.bucket,
      projectId = config.projectId || process.env.GCLOUD_PROJECT,
      googleCloudKeys = require('../tally-admin-service-account.json'),
      gcloud = require('google-cloud')({
        'projectId': projectId,
        'credentials': googleCloudKeys
      }),
      debug = require('debug')('controllers:images_controller:' + process.pid);

const getExtension = function(req, res, next) {
  const extension = fileTypeExtensions[req.query.fileType];
  if (!extension) {
    // TODO add no file extension error here
    res.sendStatus(400);
    return;
  } else {
    return extension;
  }
};

const uploadImage = function(req, res, next) {
  debug('in uploadImage');
  const bucket = gcloud.storage().bucket(envBucket),
        extension = getExtension(req, res, next),
        fileName = uuid.v4() + extension,
        file = bucket.file('images/' + fileName),
        imageUrl = baseImageUrl + '/images/' + fileName;

        if (!extension) {
          res.sendStatus(400);
          return;
        }

  req.pipe(file.createWriteStream({
    'metadata': {
      'contentType': req.query.fileType
    }
  })).on('error', function(e) {
    debug('image upload error:');
    debug(e);
    res.sendStatus(500);
  }).on('finish', function() {
    res.status(200).json({
      'imageUrl': imageUrl
    });
    next();
  });
};


module.exports = function() {
  const router = new Router();

  router.route("/upload-image")
  .post(Authorize.role("admin"), uploadImage, function(req, res) {
    debug('in POST-CREATE /upload-image');
    return res.status(201).send(req.image);
  });
  return router;
};
