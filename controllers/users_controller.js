"use strict";

var debug = require('debug')('controllers:events_controller:' + process.pid),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    async = require("async"),
    Router = require("express").Router,
    models = require('../models/index.js'),
    utils = require("../services/tokenUtils.js")



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


var userId = function(req){
  req.params['id'];
}


function fetchUserInfo(req, res, next) {
  debug("fetchUserInfo");
  var userId = req.params['id'];

  models.User.findOne({
    attributes: [
      'occupation',
      'employer',
      'name',
      'streetAddress',
      'city',
      'residenceState',
      'zip'
    ],
    where: { id: userId
  }}).then(function(user, err) {
    debug(user);
    req.user = user;
    next()
  });
}

module.exports = function() {
  var router = new Router();

  router.route("/users/:id").get(fetchUserInfo, function(req, res, next) {
    debug('in /users/:id');
    debug("userId: %s",req.params['id'])
    return res.status(200).json(req.user);
  });

  return router;
}
