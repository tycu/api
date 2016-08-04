"use strict";

var debug = require('debug')('app:controllers:authentication' + process.pid),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    // bcrypt = require('bcrypt'),
    utils = require("../services/tokenUtils.js"),
    Router = require("express").Router,
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js")),
    jwt = require("express-jwt"),
    models = require('../models/index.js');


var authenticate = function(req, res, next) {
  debug("Processing authenticate middleware");

  var email = req.body.email,
    password = req.body.password;

  if (_.isEmpty(email) || _.isEmpty(password)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'Invalid email or password'
    }));
  }

  process.nextTick(function () {
    models.User.findOne({where: { email: email }}).then(function(existingUser, err) {
      if (err || !existingUser) {
        return next(new UnauthorizedAccessError("401", {
          message: 'Invalid email or password'
        }));
      }
      existingUser.comparePassword(password, function (err, isMatch) {
        if (isMatch && !err) {

          existingUser.loginCount += 1;
          existingUser.save(function(err) {
              if (err) { throw err; }
            }).then(function(existingUser) {
              debug("User authenticated, generating token");
              utils.create(existingUser, req, res, next);
            })
        } else {
          existingUser.failedLoginCount += 1;
          existingUser.save(function(err) {
              if (err) { throw err; }
            }).then(function(existingUser) {
              return next(new UnauthorizedAccessError("401", {
                message: 'Invalid email or password'
              }));
            })

        }
      });
    })
  });
};

var createUser = function(req, res, next) {
  debug("Processing createUser middleware");

  var email = req.body.email,
    password = req.body.password;

  if (_.isEmpty(email) || _.isEmpty(password)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'Invalid email or password'
    }));
  }

  process.nextTick(function() {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    models.User.findOne({where: { email: email }}).then(
      function(existingUser, err) {
        if (err) {
          return next(new UnauthorizedAccessError("401", {message: err}));
        }
        if (existingUser) {
          return next(new UnauthorizedAccessError("401", {message: 'User already exists'}));
        } else {
          var newUser = models.User.build({
            email: email,
            loginCount: 1,
            failedLoginCount: 0,
            lastLoginAt: new Date(),
            currentLoginAt: new Date()
          })
          .setPassword(password, function(newUser, err) {
            newUser.save(function(err) {
              if (err) { throw err; }
            }).then(function(newUser) {
            debug("New user created, generating token");
            utils.create(newUser, req, res, next);
          })
        })

        }
      }
    )
  })
}


// NOTE '/api/v1' is trimmed from these routes
module.exports = function () {
  var router = new Router();

  router.route("/").get(function(req, res, next){
    return res.status(200).json({
      'revitalizingDemocracy': true
    });
  });

  // router.route("/verify").get(function(req, res, next) {
  //   return res.status(200).json(undefined);
  // });

  router.route("/verify").get(function (req, res, next) {
    utils.verify(req, res, next);
    return res.status(200).json(req.user);
  });

  router.route("/signout").get(function(req, res, next) {
    if (utils.expire(req.headers)) {
      delete req.user;
      return res.status(200).json({
        "message": "User has been successfully logged out"
      });
    } else {
      return next(new UnauthorizedAccessError("401"));
    }
  });

  router.route("/signin").post(authenticate, function (req, res, next) {
    return res.status(200).json(req.user);
  });

  router.route("/signup").post(createUser, function (req, res, next) {
    return res.status(200).json(req.user);
  });

  router.unless = require("express-unless");
  return router;
};

debug("Loaded authentication_controller.js routes");
