"use strict";

const debug = require('debug')('controllers:contributions_controller:' + process.pid),
    _ = require("lodash"),
    path = require('path'),
    Router = require("express").Router,
    models = require('../models/index.js'),
    stripeTestSecretKey = 'sk_test_EoKLhh6S0Kvb1MFWlr4PrNdi',
    stripeLiveSecretKey = 'sk_live_0qmsxPOV8apIjioQGMjlRt0o',
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js")),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    StripeError = require(path.join(__dirname, "..", "errors", "StripeError.js")),
    Authorize = require("../services/Authorize.js"),
    attributesToLoad = ['id', 'amount', 'support', 'userId', 'eventId', 'pacId',
    'createdAt', 'updatedAt']; // chargeUuid


const setCard = function(req, res, next) {
  debug("in setCard");
  const cardToken = req.body.cardToken,
        email = req.body.email,
        stripe = getStripeSecretKey(req, res, next);

  if (!cardToken) {
    res.sendStatus(400);
    return;
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
          userIden: req.body.userId
        }
      },
      function(err, customer) {
        if (err) {
          handleStripeError(err, res);
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
            });
          });
        }
      });
    }
  });
};

const getCustomer = function(req, res, next) {
  const email  = req.body.email,
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
    const stripeCustomerUuid = existingUser.stripeCustomerUuid;
    if (stripeCustomerUuid) {
      getStripeCustomer(stripeCustomerUuid, stripe, function(customer) {
        res.customer = customer;
        res.user = existingUser;
        next();
      });
    }
  });
};

const getStripeCustomer = function(stripeCustomerUuid, stripe, next) {
  stripe.customers.retrieve(stripeCustomerUuid, function(err, customer) {
    return next(customer);
  });
};

const getStripeSecretKey = function(req, res, next) {
  debug("inside getStripeSecretKey");
  let stripe;

  if (req.body.stripePublicKey === 'pk_live_xA1b8BrgpABNkeSdeCMvGYg8') { // old: pk_live_EvHoe9L6R3fKkOyA6WNe3r1S
      debug('*** using stripe live!!! ***');
    // stripe = require('stripe')(stripeLiveSecretKey);
  } else {
    stripe = require('stripe')(stripeTestSecretKey);
  }
  return stripe;
};

const handleStripeError = function(err, res) {
  if (err.rawType === 'card_error' && err.message) {
    res.status(400).json({
      'error': {
        'message': err.message
      }
    });
  } else {
    res.sendStatus(400);
    debug(err);
  }
};

const getEventContributions = function(req, res, next) {
  debug("getEventContributions");
  models.Contribution.findAll({
    where: {eventId: req.eventId },
    attributes: attributesToLoad,
    limit: 50,
    order: '"id" DESC'
  }).then(function(contributions, err) {
    debug(contributions);
    req.contributions = contributions;
    next();
  });
};

const getContributionReport = function(req, res, next) {
  debug("getContributionReport");

  models.sequelize.query(
    'SELECT date_trunc(\'day\', "c"."createdAt") AS "day", count(*) AS "contrib_per_day", SUM(CAST(coalesce("c"."amount", \'0\') AS integer)) AS "daily_sum" FROM "Contributions" AS "c" GROUP BY "day" ORDER BY 1 DESC LIMIT 30 OFFSET 0;'
  ).then(function(contributions, err) {
    debug(contributions);
    req.contributions = contributions;
    next();
  });
}

module.exports = function() {
  const router = new Router();

  router.route('/get-customer')
  .post(Authorize.role("user"), getCustomer, function(req, res, next) {
    debug("in /get-customer route");
    return res.status(200).json({user: res.user, customer: res.customer});
  });

  // TODO make sure are passing user ID or email by which to look up user if not found by stripe ID
  router.route("/set-customer")
  .put(Authorize.role("user"), setCard, function(req, res, next) {
    debug("in /set-customer route");

    return res.status(200).json({
      "message": "Customer set successfully in Stripe.",
      "customer": req.customer,
      "user": req.user
    });
  });


  router.route("/contribution_report")
  .get(Authorize.role("admin"), getContributionReport, function(req, res, next) {
    debug("in GET-INDEX /contribution_report");
    return res.status(200).json(req.contributions);
  });

  router.route("/events/:eventId/contributions")
  .get(Authorize.role("admin"), getEventContributions, function(req, res, next) {
    debug("in /events/:eventId/contributions route");
    return res.status(200).json(req.events);
  });

  return router;
};
