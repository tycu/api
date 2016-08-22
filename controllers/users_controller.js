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
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js"));

// NOTE example of get all users call
// app.get('/v1/users', function(req, res) {
//   var users = models.User.findAll();
//   users.then(function (value) {
//     res.json({users: value});
//   });
// });

function loadUser(req) {
  var userId = req.params['id'];
  debug("userId: %s", userId);

  return models.User.findOne({
    attributes: [
      'id',
      'occupation',
      'employer',
      'name',
      'streetAddress',
      'city',
      'residenceState',
      'zip'
    ],
    where: { id: userId }
  })
}

function fetchUserInfo(req, res, next) {
  debug("fetchUserInfo");
  loadUser(req)
  .then(function(user, err) {
    debug(user);
    req.user = user;
    next()
  });
}

function updateUserInfo(req, res, next) {
  debug("updateUserInfo");
  loadUser(req)
  .then(function(user, err) {
    // debug("loaded user %s", user)

    user.id = user.id
    if (req.body.donorInfo.name) {
      user.name = req.body.donorInfo.name
    }
    if (req.body.donorInfo.occupation) {
      user.occupation = req.body.donorInfo.occupation
    }
    if (req.body.donorInfo.employer) {
      user.employer = req.body.donorInfo.employer
    }
    if (req.body.donorInfo.streetAddress) {
      user.streetAddress = req.body.donorInfo.streetAddress
    }
    if (req.body.donorInfo.city) {
      user.city = req.body.donorInfo.city
    }
    if (req.body.donorInfo.residenceState) {
      user.residenceState = req.body.donorInfo.residenceState
    }
    if (req.body.donorInfo.zip) {
      user.zip = req.body.donorInfo.zip
    }
    user.updatedAt = Date.now() / 1000
    user.save(function(err) {
        if (err) { throw err; }
      }).then(function(existingUser) {
        next();
      })
  })
  .catch(function(error, user) {
    return next(new SequelizeError("422", {message: err}));
  });
}

var requireUserRole = function(role) {
  return function(req, res, next) {
    debug("above check for match")
    // debug(parseInt(req.currentUser.id, 10) === parseInt(req.params['id'], 10));
    // debug((req.currentUser && req.currentUser.role == role && parseInt(req.currentUser.id, 10) === parseInt(req.params['id'], 10)))
    // debug(req.currentUser.role == role)
    // debug(req.currentUser.role)
    // debug(role)


    if (!req.currentUser) {
      return next(new UnauthorizedAccessError("403", {
        message: 'Cannot access resource.'
      }));
    }
    if (req.currentUser && req.currentUser.role === 'admin') {
      return next();
    }
    else if (req.currentUser.role == role && parseInt(req.currentUser.id, 10) === parseInt(req.params['id'], 10)) {
      return next();
    }
    else {
      req.user = null;
      return next(new UnauthorizedAccessError("403", {
        message: 'Cannot access resource.'
      }));
    }
  }
}

module.exports = function() {
  var router = new Router();

  router.route("/users/:id")
  .get(requireUserRole("user"), function(req, res, next) {
    fetchUserInfo(req, res, next);
    debug('in GET /users/:id');
    debug("userId: %s", req.params['id'])
    return res.status(200).json(req.user);
  })
  .put(requireUserRole("user"), function(req, res, next) {
    // used to be a POST to /v1/update-profile
    updateUserInfo(req, res, next);
    debug('in PUT /users/:id');
    debug("userId: %s",req.params['id'])
    return res.status(200).json(req.user);
  });

  return router;
}
