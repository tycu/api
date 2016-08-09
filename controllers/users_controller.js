"use strict";

var debug = require('debug')('controllers:users_controller:' + process.pid),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    async = require("async"),
    Router = require("express").Router,
    models = require('../models/index.js'),
    utils = require("../services/tokenUtils.js"),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js"));



  // app.get('/v1/users', function(req, res) {
  //   var users = models.User.findAll();
  //   users.then(function (value) {
  //     res.json({users: value});
  //   });
  // });



//   // used to be a POST to /v1/update-profile
//   app.post('/v1/user/:userId', function(req, res) {

//     models.User.findOne({where: { id: userId(req) }}).then(function(user, err) {


//       console.log('user', user);
//       console.log('req', req);


//       if (req.body.name) {
//         user.name = req.body.name
//       }
//       if (req.body.occupation) {
//         user.occupation = req.body.occupation
//       }
//       if (req.body.employer) {
//         user.employer = req.body.employer
//       }
//       if (req.body.streetAddress) {
//         user.streetAddress = req.body.streetAddress
//       }
//       if (req.body.cityStateZip) {
//         user.cityStateZip = req.body.cityStateZip
//       }

//       var now = Date.now() / 1000
//       req.user.modified = now

//       user.save()
//       .then(function(anotherTask) {
//         // you can now access the currently saved task with the variable anotherTask... nice!
//       }).catch(function(error) {
//         // Ooops, do some error-handling
//     })

//   });
// }


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
    // debug("req.body")
    // debug(req.body);

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

    // debug("req.body.donorInfo.zip")
    // debug(req.body.donorInfo.zip)
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

module.exports = function() {
  var router = new Router();

  router.route("/users/:id").get(fetchUserInfo, function(req, res, next) {
    debug('in GET /users/:id');
    debug("userId: %s",req.params['id'])
    return res.status(200).json(req.user);
  });

  router.route("/users/:id").put(updateUserInfo, function(req, res, next) {
    debug('in PUT /users/:id');
    debug("userId: %s",req.params['id'])
    return res.status(200).json(req.user);
  });

  return router;
}
