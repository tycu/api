"use strict";

var debug = require('debug')('controllers:events_controller:' + process.pid),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    async = require("async"),
    Router = require("express").Router,
    models = require('../models/index.js'),
    stripeTestSecretKey = 'sk_test_EoKLhh6S0Kvb1MFWlr4PrNdi',
    stripeLiveSecretKey = 'sk_live_0qmsxPOV8apIjioQGMjlRt0o',
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js")),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    StripeError = require(path.join(__dirname, "..", "errors", "StripeError.js"));

// var crypto = require('crypto')
// var entities = require('../entities')(redis)
    // request = require('request'),
    // redisKeys = require('../redis-keys'),


var getEventContributions = function(req, res, next) {
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



var setCard = function(req, res, next) {
  debug("in setCard")
  var cardToken = req.body.cardToken,
      email = req.body.email,
      stripe = getStripeSecretKey(req, res, next);

  if (!cardToken) {
    res.sendStatus(400)
    return
  }

  if (_.isEmpty(email)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'Something went wrong retrieving user.'
    }));
  }

  debug("before looking up user by stripeCustomerUuid");
  models.User.findOne({where: { email: email, stripeCustomerUuid: {ne: null} }})
  .then(function(existingUser, err) {
    if (err) {
      return next(new StripeError("500", {
        message: 'error finding user by email'
      }));
    }
    else if (existingUser) {
      // NOTE handles credit card update (allows just default card).
      stripe.customers.update(existingUser.stripeCustomerUuid, {
        'source': cardToken
      }, function(err, customer) {
        if (err) {
          handleStripeError(err, res);
        } else {
          next();
        }
      });
    }
    else {
      debug("before creating stripe customer");
      stripe.customers.create({
        source: cardToken,
        email: req.body.email,
        metadata: {
          userIden: req.body.userId,
        }
      },
      function(err, customer) {
        if (err) {
          handleStripeError(err, res)
        } else {
          debug("customer created!");
          debug(customer);

          models.User.findOne({where: { email: email }})
          .then(function(existingUser, err) {
            existingUser.stripeCustomerUuid = customer.id;
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
  var email = req.body.email,
      stripe = getStripeSecretKey(req, res, next);

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
    var stripeCustomerUuid = existingUser.stripeCustomerUuid
    if (stripeCustomerUuid) {
      getStripeCustomer(stripeCustomerUuid, stripe, function(customer) {
        res.customer = customer;
        res.user = existingUser;
        next();
      })
    }
  })
}

var getStripeCustomer = function(stripeCustomerUuid, stripe, next) {
  stripe.customers.retrieve(stripeCustomerUuid, function(err, customer) {
    return next(customer);
  });
}

var getStripeSecretKey = function(req, res, next) {
  debug("inside getStripeSecretKey");
  var stripe;

  if (req.body.stripePublicKey == 'pk_live_xA1b8BrgpABNkeSdeCMvGYg8') { // old: pk_live_EvHoe9L6R3fKkOyA6WNe3r1S
      alert('using stripe live!!!');
    // stripe = require('stripe')(stripeLiveSecretKey);
  } else {
    stripe = require('stripe')(stripeTestSecretKey);
  }
  return stripe;
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

  router.route('/get-customer').post(getCustomer, function(req, res, next) {
    debug("in /get-customer route");
    return res.status(200).json({user: res.user, customer: res.customer});
  });

  // TODO make sure are passing user ID or email by which to look up user if not found by stripe ID
  router.route("/set-customer").put(setCard, function(req, res, next) {
    debug("in /set-customer route")

    return res.status(200).json({
      "message": "Customer set successfully in Stripe.",
      "customer": req.customer,
      "user": req.user
    });
  });

  router.route("/contributions").get(getEventContributions, function(req, res, next) {
    debug("in /events/:id/contributions route");
    return res.status(200).json(req.events);
  });

  return router;
}
