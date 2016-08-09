var async = require("async")
var request = require('request')
var crypto = require('crypto')
var redisKeys = require('../redis-keys')
var sendgrid  = require('sendgrid')('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')

var stripeTestSecretKey = 'sk_test_rtBOxo0prIIbfVocTi4l1gPC'
var stripeLiveSecretKey = 'sk_live_ENFmtxmEkWjtk9E7a53VF8Kf'


module.exports = function(app, redis) {
  var entities = require('../entities')(redis)
  var models = require('../models/index.js');

  app.post('/v1/set-card', function(req, res) {
    if (!req.body.cardToken) {
      res.sendStatus(400)
      return
    }

    var stripe
    if (req.body.stripeKey == 'pk_live_EvHoe9L6R3fKkOyA6WNe3r1S') {
        alert('using live!!!');
      // stripe = require('stripe')(stripeLiveSecretKey)
    } else {
      stripe = require('stripe')(stripeTestSecretKey)
    }

    redis.hget(redisKeys.userIdenToStripeCustomerId, req.user.iden, function(err, reply) {
      if (err) {
        res.sendStatus(500)
        console.error(err)
      } else if (reply) {
          stripe.customers.update(reply, {
            'source': req.body.cardToken
          }, function(err, customer) {
          if (err) {
            handleStripeError(err, res)
          } else {
            res.sendStatus(200)
          }
        })
      } else {
      stripe.customers.create({
        'source': req.body.cardToken,
        'metadata': {
          'userIden': req.user.iden
        }
        }, function(err, customer) {
          if (err) {
            handleStripeError(err, res)
          } else {
          redis.hset(redisKeys.userIdenToStripeCustomerId, req.user.iden, customer.id, function(err, reply) {
            if (err) {
              res.sendStatus(400)
              console.error(err)
            } else {
              res.sendStatus(200)
            }
            })
          }
        })
      }
    })
  })


    app.post('/v1/create-contribution', function(req, res) {
        if (!req.body.eventIden || !req.body.pacIden || !req.body.amount) {
            res.sendStatus(400)
            return
        }

        var usingLiveStripeKey = false
        var stripe
        if (req.body.stripeKey == 'pk_live_EvHoe9L6R3fKkOyA6WNe3r1S') {
            stripe = require('stripe')(stripeLiveSecretKey)
            usingLiveStripeKey = true
        } else {
            stripe = require('stripe')(stripeTestSecretKey)
        }

        var tasks = []
        tasks.push(function(callback) {
            redis.hget(redisKeys.userIdenToStripeCustomerId, req.user.iden, function(err, reply) {
                callback(err, reply)
            })
        })
        tasks.push(function(callback) {
            entities.getEvent(req.body.eventIden, function(err, event) {
                callback(err, event)
            })
        })
        tasks.push(function(callback) {
            entities.getPac(req.body.pacIden, function(err, pac) {
                callback(err, pac)
            })
        })

        async.parallel(tasks, function(err, results) {
            if (err) {
                res.sendStatus(500)
                console.error(err)
            } else {
                var customerId = results[0]
                if (!customerId) {
                    res.sendStatus(400)
                    return
                }

                var event = results[1]
                if (!event) {
                    res.sendStatus(400)
                    return
                }

                var pac = results[2]
                if (!pac) {
                    res.sendStatus(400)
                    return
                }

                var support
                if (event.supportPacs.indexOf(pac.iden) != -1) {
                    support = true
                } else if (event.opposePacs.indexOf(pac.iden) != -1) {
                    support = false
                } else { // This PAC is no longer associated with this event
                    res.sendStatus(400)
                    return
                }

                var contributionCents = Math.min(req.body.amount * 100, 100 * 100) // Amount is in dollars, Strip API is in cents
                var feeCents = Math.max(Math.round(contributionCents * 0.15), 99)

                stripe.charges.create({
                    'amount': (contributionCents + feeCents),
                    'currency': 'usd',
                    'customer': customerId,
                    'destination': usingLiveStripeKey ? 'acct_17x01lHDt37fcAHU' : 'acct_17wOjAKqY1mnS1Yq',
                    'application_fee': feeCents,
                    'metadata': {
                        'eventIden': event.iden,
                        'pacIden': pac.iden,
                        'support': support
                    }
                }, function(err, charge) {
                    if (err) {
                        handleStripeError(err, res)
                    } else {
                        var now = Date.now() / 1000

                        var contribution = {
                            'iden': entities.generateIden(),
                            'created': now,
                            'modified': now,
                            'chargeId': charge.id,
                            'amount': req.body.amount,
                            'user': req.user.iden,
                            'event': event.iden,
                            'pac': pac.iden,
                            'support': support
                        }

                        var tasks = []
                        tasks.push(function(callback) {
                            redis.hset(redisKeys.contributions, contribution.iden, JSON.stringify(contribution), function(err, reply) {
                                callback(err) // Only this one returns error to stop things and prevent an invalid state
                            })
                        })
                        tasks.push(function(callback) {
                            redis.lpush(redisKeys.userReverseChronologicalContributions(req.user.iden), contribution.iden, function(err, reply) {
                                callback(null, err)
                            })
                        })
                        tasks.push(function(callback) {
                            redis.incrby(redisKeys.userContributionsSum(req.user.iden), contribution.amount, function(err, reply) {
                                callback(null, err)
                            })
                        })
                        if (usingLiveStripeKey) {
                            tasks.push(function(callback) {
                                var key = support ? 'support' : 'oppose'
                                redis.hincrby(redisKeys.eventContributionTotals(event.iden), key, contribution.amount, function(err, reply) {
                                    callback(null, err)
                                })
                            })
                            tasks.push(function(callback) {
                                var key = support ? 'support' : 'oppose'
                                redis.hincrby(redisKeys.politicianContributionTotals(event.politician), key, contribution.amount, function(err, reply) {
                                    callback(null, err)
                                })
                            })
                            tasks.push(function(callback) {
                                redis.zincrby(redisKeys.eventsSortedByContributionSums, req.body.amount, event.iden, function(err, reply) {
                                    callback(null, err)
                                })
                            })
                            tasks.push(function(callback) {
                                redis.incrby(redisKeys.contributionsSum, contribution.amount, function(err, reply) {
                                    callback(null, err)
                                })
                            })
                            tasks.push(function(callback) {
                                redis.rpush(redisKeys.contributionsToday(), contribution.iden, function(err, reply) {
                                    callback(null, err)
                                })
                            })
                        }

                        async.series(tasks, function(err, results) {
                            if (err) {
                                console.error(JSON.stringify(contribution))
                                console.error(err)
                            } else {
                                var errors = results.filter(function(result) {
                                    return !!result
                                })

                                if (errors.length > 0) {
                                    console.error(JSON.stringify(contribution))
                                    errors.forEach(function(error) {
                                        console.error(error)
                                    })
                                }
                            }

                            res.sendStatus(200)
                        })
                    }
                })
            }
        })
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





// cut from users controller, old endpoint code:
  app.post('/v1/get-user-data', function(req, res) {
    var tasks = []
    tasks.push(function(callback) {
      redis.hget(redisKeys.userIdenToStripeCustomerId, req.user.iden, function(err, reply) {
        callback(err, reply)
      })
    })
    tasks.push(function(callback) {
      entities.listUserContributions(req.user.iden, function(err, contributions) {
        callback(err, contributions)
      })
    })

    async.parallel(tasks, function(err, results) {
      if (err) {
        res.sendStatus(500)
        console.error(err)
      } else {
        res.json({
          'profile': req.user,
          'chargeable': !!results[0],
          'contributions': results[1]
        })
      }
    })
  })