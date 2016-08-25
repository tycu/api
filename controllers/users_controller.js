"use strict";

const debug = require('debug')('controllers:users_controller:' + process.pid),
      path = require('path'),
      Router = require("express").Router,
      models = require('../models/index.js'),
      SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
      Authorize = require("../services/Authorize.js"),
      attributesToLoad = [
      'id',
      'occupation',
      'employer',
      'name',
      'streetAddress',
      'city',
      'residenceState',
      'zip'
    ];

// NOTE example of get all users call
// app.get('/v1/users', function(req, res) {
//   var users = models.User.findAll();
//   users.then(function (value) {
//     res.json({users: value});
//   });
// });

function loadUser(req) {
  const userId = req.params.id;
  debug("userId: %s", userId);

  return models.User.findOne({
    attributes: attributesToLoad,
    where: { id: userId }
  });
}

function fetchUserInfo(req, res, next) {
  debug("fetchUserInfo");
  loadUser(req)
  .then(function(user, err) { // TODO handle error
    debug(user);
    req.user = user;
    next();
  });
}

function updateUserInfo(req, res, next) {
  debug("updateUserInfo");
  loadUser(req)
  .then(function(user, err) { // TODO handle error
    // debug("loaded user %s", user)

    user.id = user.id;
    if (req.body.donorInfo.name) {
      user.name = req.body.donorInfo.name;
    }
    if (req.body.donorInfo.occupation) {
      user.occupation = req.body.donorInfo.occupation;
    }
    if (req.body.donorInfo.employer) {
      user.employer = req.body.donorInfo.employer;
    }
    if (req.body.donorInfo.streetAddress) {
      user.streetAddress = req.body.donorInfo.streetAddress;
    }
    if (req.body.donorInfo.city) {
      user.city = req.body.donorInfo.city;
    }
    if (req.body.donorInfo.residenceState) {
      user.residenceState = req.body.donorInfo.residenceState;
    }
    if (req.body.donorInfo.zip) {
      user.zip = req.body.donorInfo.zip;
    }
    user.updatedAt = Date.now() / 1000;
    user.save(function(err) {
      if (err) { throw err; }
    }).then(function() { // existingUser
      next();
    });
  })
  .catch(function(error, user) {
    return next(new SequelizeError("422", {message: error}));
  });
}

module.exports = function() {
  const router = new Router();

  router.route("/users/:id")
  .get(Authorize.role("user"), fetchUserInfo, function(req, res) {
    debug('in GET /users/:id');
    debug("userId: %s", req.params.id);
    return res.status(200).json(req.user);
  })
  .put(Authorize.role("user"), function(req, res, next) {
    updateUserInfo(req, res, next);
    debug('in PUT /users/:id');
    debug("userId: %s",req.params.id);
    return res.status(200).json(req.user);
  });

  return router;
};
