"use strict";

const debug = require('debug')('controllers:contributions_controller:' + process.pid),
    _ = require("lodash"),
    path = require('path'),
    Router = require("express").Router,
    models = require('../models/index.js'),
    env = process.env.NODE_ENV || "development",
    stripeConfig = require('../config/stripeConfig.json')[env],
    stripeSecretKey = stripeConfig['secretKey'],
    stripDestination = stripeConfig['destination'],
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js")),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    StripeError = require(path.join(__dirname, "..", "errors", "StripeError.js")),
    Authorize = require("../services/Authorize.js"),
    async = require("async"),
    userMailer = require("../mailers/user_mailer.js"),
    attributesToLoad = ['id', 'donationAmount', 'feeAmount', 'support', 'userId', 'eventId', 'pacId',
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

  if (req.body.stripePublicKey === 'pk_live_xA1b8BrgpABNkeSdeCMvGYg8') {
    // NOTE clean up for prod
      debug('*** using stripe live!!! ***');
    // stripe = require('stripe')(stripeSecretKey);
  } else {
    stripe = require('stripe')(stripeSecretKey);
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

const chargeCustomer = function(req, res, next) {
  debug('chargeCustomer');

  const customerId = req.body.customerId,
        eventId    = req.body.eventId,
        pacId      = req.body.pacId,
        support    = req.body.support,
        amount     = req.body.amount,
        userId     = req.currentUser.id,
        email      = req.currentUser.email,
        donationCents = Math.floor(req.body.amount * 100),
        feeCents  = Math.min(Math.round(donationCents * 0.15), 2000), // MAX fee $20.00
        stripe = getStripeSecretKey(req, res, next),
        requiredParams = ['customerId', 'eventId', 'pacId',
          'support','amount'];

  requiredParams.forEach(function(param) {
    if (!param) {
      res.status(400).send({error: 'missing param: %s', param});
      return;
    }
  });


  var usingLiveStripeKey = false;
  var tasks = [];

  async.parallel(tasks, function(err, results) {
    if (err) {
      res.status(500).send({error: err});
      console.error(err);
    }
    else {
      // Add validation around key existing



      // var customerId = results[0]
      // if (!customerId) {
      //   res.sendStatus(400);
      //   return;
      // }

      // var event = results[1]
      // if (!event) {
      //   res.sendStatus(400);
      //   return;
      // }

      // var pac = results[2]
      // if (!pac) {
      //   res.sendStatus(400);
      //   return;
      // }

      // var support
      // if (event.supportPacs.indexOf(pac.iden) != -1) {
      //   support = true;
      // }
      // else if (event.opposePacs.indexOf(pac.iden) != -1) {
      //   support = false;
      // }
      // else { // This PAC is no longer associated with this event
      //   res.sendStatus(400);
      //   return;
      // }


      // Amount is in dollars, Stripe API is in cents

      stripe.charges.create({
        'amount': (donationCents + feeCents),
        'currency': 'usd',
        'customer': customerId,
        // 'destination': stripeConfig['destination'], // NOTE don't need
        // 'application_fee': feeCents,
        'metadata': {
          'eventId': eventId,
          'pacId': pacId,
          'support': support
        }
      }, function(err, charge) {
        debug('charge:::');
        debug(charge);

        if (err) {
          handleStripeError(err, res)
        }
        else {
          const newContribution = models.Contribution.build({
            donationAmount: donationCents,
            feeAmount: feeCents,
            support: support,
            userId: userId,
            eventId: eventId,
            pacId: pacId,
            chargeUuid: charge.id
          });
          newContribution.save(function(newContribution, err) {
            debug('saving new Contribution');
            debug(newContribution);

            debug(newContribution);
            debug(err);

            if (newContribution) {
              throw newContribution;
            }
            if (err) {
              throw err;
            }
          })
          .catch(function(err, newContribution){
            return next(new SequelizeError("422", {message: err}));
          })
          .then(function(newContribution, err) {


            userMailer.sendDonationReceivedMail(newContribution, email, function(error, response) {
              debug("confirm sending donation received email:");
              debug(response);
              next(err, newContribution);
            });
          });



          // var tasks = []
          // tasks.push(function(callback) {
          //   redis.hset(redisKeys.contributions, contribution.iden, JSON.stringify(contribution), function(err, reply) {
          //       callback(err) // Only this one returns error to stop things and prevent an invalid state
          //   })
          // })
          // tasks.push(function(callback) {
          //   redis.lpush(redisKeys.userReverseChronologicalContributions(req.user.iden), contribution.iden, function(err, reply) {
          //       callback(null, err)
          //   })
          // })
          // tasks.push(function(callback) {
          //   redis.incrby(redisKeys.userContributionsSum(req.user.iden), contribution.amount, function(err, reply) {
          //       callback(null, err)
          //   })
          // })

          // if (usingLiveStripeKey) {
          //   tasks.push(function(callback) {
          //     var key = support ? 'support' : 'oppose'
          //     redis.hincrby(redisKeys.eventContributionTotals(event.iden), key, contribution.amount, function(err, reply) {
          //         callback(null, err)
          //     })
          //   })
          //   tasks.push(function(callback) {
          //     var key = support ? 'support' : 'oppose'
          //     redis.hincrby(redisKeys.politicianContributionTotals(event.politician), key, contribution.amount, function(err, reply) {
          //         callback(null, err)
          //     })
          //   })
          //   tasks.push(function(callback) {
          //     redis.zincrby(redisKeys.eventsSortedByContributionSums, req.body.amount, event.iden, function(err, reply) {
          //         callback(null, err)
          //     })
          //   })
          //   tasks.push(function(callback) {
          //     redis.incrby(redisKeys.contributionsSum, contribution.amount, function(err, reply) {
          //       callback(null, err)
          //     })
          //   })
          //   tasks.push(function(callback) {
          //     redis.rpush(redisKeys.contributionsToday(), contribution.iden, function(err, reply) {
          //       callback(null, err)
          //     })
          //   })
          // }

          // async.series(tasks, function(err, results) {
          //   if (err) {
          //     console.error(JSON.stringify(contribution))
          //     console.error(err)
          //   }
          //   else {
          //     var errors = results.filter(function(result) {
          //       return !!result
          //     })

          //     if (errors.length > 0) {
          //       console.error(JSON.stringify(contribution))
          //       errors.forEach(function(error) {
          //         console.error(error)
          //       })
          //     }
          //   }
          //   res.sendStatus(200);
          // });


        }
      })
    }
  })
}


const getEventContributions = function(req, res, next) {
  debug("getEventContributions");
  const eventId = req.params.eventId;

  models.Contribution.find({where: {eventId: eventId },
    attributes: [[models.sequelize.fn('SUM', models.sequelize.col('amount')), 'total']]
  })
  .then(function(result, err) {
    req.contributions = result;
    next();
  });
};

const getContributionReport = function(req, res, next) {
  debug("getContributionReport");

  models.sequelize.query(
    'SELECT date_trunc(\'day\', "c"."createdAt") AS "day", count(*) AS "contrib_per_day", SUM(CAST(coalesce("c"."donationAmount", \'0\') AS integer)) AS "daily_sum" FROM "Contributions" AS "c" GROUP BY "day" ORDER BY 1 DESC LIMIT 30 OFFSET 0;'
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

  router.route("/charge-customer")
  .post(Authorize.role("user"), chargeCustomer, function(req, res, next) {
    debug("in /charge-customer route");

    return res.status(200).json({
      // "message": "Customer set successfully in Stripe.",
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
    return res.status(200).json(req.contributions);
  });

  return router;
};
