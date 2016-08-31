"use strict";

const path = require("path"),
      bodyParser = require('body-parser'),
      workers = process.env.WEB_CONCURRENCY || 1,
      port = process.env.PORT || 5000,
      jwt = require("express-jwt"),
      env = process.env.NODE_ENV || "development",
      config = require("./config/jwtOptions.json")[env],
      onFinished = require('on-finished'),
      debug = require('debug')('app:' + process.pid),
      NotFoundError = require(path.join(__dirname, "errors", "NotFoundError.js")),
      tokenUtils = require(path.join(__dirname, "/services/tokenUtils.js"));

const start = function() {
  debug("Starting application in NODE_ENV: %s", env);

  debug("Initializing express");
  const express = require('express'),
        app = express();

  let redis;

  debug("Attaching plugins");
  app.use(require('morgan')("dev"));
  app.use(require('cors')());
  app.use(require('body-parser').json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(require('compression')());
  app.use(require('response-time')());

  app.use(function (req, res, next) {
    onFinished(res, function () { // NOTE could be (err)
      debug("[%s] finished request", req.connection.remoteAddress);
    });
    next();
  });

  // NOTE allow base route/status ping
  app.get('/', function(req, res) {
    res.json({
      'revitalizingDemocracy': true
    });
  });

  // TODO this is not good but prevents errors for now.
  app.get('/favicon.ico', function(req, res) {
    res.status(200);
  });

  app.use(jwt({
    secret: config.secret
  }).unless({path: [
    '/',
    '/api/v1/signin',
    '/api/v1/signup',
    // '/api/v1/events', // breaking other event routes as not auth'd
    '/api/v1/fetchBreaking',
    '/api/v1/email_verification',
    '/api/v1/email_reset',
    '/api/v1/update_password',
    '/favicon.*'
  ]}));

  app.use(tokenUtils.middleware().unless({path: [
    '/',
    '/api/v1/signin',
    '/api/v1/signup',
    // '/api/v1/events',  // breaking other event routes as not auth'd
    '/api/v1/fetchBreaking',
    '/api/v1/email_verification',
    '/api/v1/email_reset',
    '/api/v1/update_password',
    '/favicon.*'
  ]}));

  app.use("/api/v1", require(path.join(__dirname, "controllers", "authentication_controller.js"))());
  app.use("/api/v1", require(path.join(__dirname, "controllers", "users_controller.js"))());
  app.use("/api/v1", require(path.join(__dirname, "controllers", "contributions_controller.js"))());
  app.use("/api/v1", require(path.join(__dirname, "controllers", "pacs_controller.js"))());
  app.use("/api/v1", require(path.join(__dirname, "controllers", "pac_events_controller.js"))());
  app.use("/api/v1", require(path.join(__dirname, "controllers", "events_controller.js"))());
  app.use("/api/v1", require(path.join(__dirname, "controllers", "politicians_controller.js"))());
  app.use("/api/v1", require(path.join(__dirname, "controllers", "events_controller.js"))());
  app.use("/api/v1", require(path.join(__dirname, "controllers", "images_controller.js"))());
  app.use("/api/v1", require(path.join(__dirname, "controllers", "politician_photos_controller.js"))());

  // require('./controllers/contributions_controller')(app, redis);
  // require('./controllers/users_controller')(app);

  // all other requests redirect to 404
  app.all("*", function (req, res, next) {
    next(new NotFoundError("404"));
  });

  // error handler for all the applications
  app.use(function (err, req, res) {
    if (env === 'development' || env === 'test') {
      debug("err from main.js %s", err);
    }

    const errorType = typeof err;

    let   code = 500,
          msg = { message: "Internal Server Error" };

    switch (err.name) {
      case "UnauthorizedError":
        code = err.status;
        msg = undefined;
        break;
      case "BadRequestError":
      case "UnauthorizedAccessError":
      case "NotFoundError":
      case "SequelizeError":
        code = err.status;
        msg = err.inner;
        break;
      default:
        break;
    }
    return res.status(code).json({msg: msg, errorType: errorType});
  });

  if (process.env.REDISCLOUD_URL) {
    redis = require("redis").createClient(process.env.REDISCLOUD_URL, { 'no_ready_check': true });
  } else {
    redis = require("redis").createClient();
  }

  // Require HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    app.use(function(req, res, next) {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        res.status(403).json({
          'error': {
            'message': 'This server is only accessible over HTTPS.'
          }
        });
      } else {
        next();
      }
    });
  }

  // Patch sendStatus to always send json
  app.use(function(req, res, next) {
    res.sendStatus = function(statusCode) {
      res.status(statusCode).json({});
    };
    next();
  });

  app.listen(port, function() {
    debug('SUCCESS: tally-api listening on port ' + port);
  });
};

debug("Starting throng on port: %s, with workers: %s", port, workers);
require('throng')(start, {
  'workers': workers,
  'lifetime': Infinity
});
