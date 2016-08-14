"use strict";

var debug = require('debug')('controllers:events_controller:' + process.pid),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    async = require("async"),
    Router = require("express").Router,
    models = require('../models/index.js'),
    stripeTestSecretKey = 'sk_test_rtBOxo0prIIbfVocTi4l1gPC',
    stripeLiveSecretKey = 'sk_live_ENFmtxmEkWjtk9E7a53VF8Kf',
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js")),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    StripeError = require(path.join(__dirname, "..", "errors", "StripeError.js"));

// var crypto = require('crypto')
// var entities = require('../entities')(redis)
    // request = require('request'),
    // redisKeys = require('../redis-keys'),


function getEventContributions(req, res, next) {
  debug("getEventContributions");
  models.Event.findAll({
    where: {eventId: req.eventId },
    attributes: ['id', 'isPinned', 'imageUrl', 'imageAttribution', 'politicianId', 'headline', 'summary', 'createdAt', 'updatedAt'],
    limit: 10,
    order: '"id" DESC'
  }).then(function(events, err) {
    debug(events);
    req.events = events;
    next()
  });
}





function setCard(req, res, next) {
  if (!req.body.cardToken) {
    res.sendStatus(400)
    return
  }

  var email = req.body.email;
  if (_.isEmpty(email)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'Something went wrong retrieving user.'
    }));
  }


  var stripe;
  if (req.body.stripeKey == 'pk_live_EvHoe9L6R3fKkOyA6WNe3r1S') {
      alert('using live!!!');
    // stripe = require('stripe')(stripeLiveSecretKey);
  } else {
    stripe = require('stripe')(stripeTestSecretKey);
  }

  // look for user based on stripe customer key


  models.User.findOne({where: { stripeCustomerUuid: cardToken }})
  .then(function(existingUser, err) {
    if (err) {
      return next(new StripeError("500", {
        message: 'error finding user by stripe id'
      }));
    }
    else if (existingUser) {
        stripe.customers.update(reply, {
          'source': req.body.cardToken
        }, function(err, customer) {
        if (err) {
          handleStripeError(err, res)
        } else {
          next();
        }
      })
    }
    else {
      stripe.customers.create({
        'source': req.body.cardToken,
        'metadata': {
          'userIden': req.user.iden
        }
      }, function(err, customer) {
        if (err) {
          handleStripeError(err, res)
        } else {


          models.User.findOne({where: { email: email }})
          .then(function(existingUser, err) {
            existingUser.stripeCustomerUuid = customer.cardToken;
            existingUser.save(function(err) {
              if (err) { throw err; }
            })
            .then(function(existingUser) {
              next();
            })
          })
        }
      })
    }
  })
}

var getCustomer = function(req, res, next) {
  var email = req.query.email;
  if (_.isEmpty(email)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'Something went wrong retrieving user.'
    }));
  }
  models.User.findOne({
    attributes: ['stripeCustomerUuid'],
    where: { email: email }
  })
  .then(function(existingUser, err) {
    req.user = existingUser;
    next();
  })
}

var handleStripeError = function(err, res) {
  if (err.rawType == 'card_error' && err.message) {
    res.status(400).json({
      'error': {
        'message': err.message
      }
    })
  } else {
    res.sendStatus(400)
    console.error(err)
  }
}

module.exports = function() {
  var router = new Router();

  router.route('/get-customer').get(getCustomer, function(req, res, next) {
    debug("in /get-customer route");
    return res.status(200).json(req.user);
  });

  // TODO make sure are passing user ID or email by which to look up user if not found by stripe ID
  router.route("/set-card").post(setCard, function(req, res, next) {
    debug("in set-card route")

    return res.status(200).json({
      "message": "Customer set successfully in Stripe."
    });
  });


  router.route("/contributions").get(getEventContributions, function(req, res, next) {
    debug("in /events/:id/contributions route");
    return res.status(200).json(req.events);
  });

  return router;
}
