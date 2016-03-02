'use strict'

var async = require("async")
var request = require('request')
var crypto = require('crypto')
var redisKeys = require('./redis-keys')
var stripe = require('stripe')('sk_test_rtBOxo0prIIbfVocTi4l1gPC')

module.exports = function(app, redis) {
    app.get('/', function(req, res) {
        res.json({
            'revitalizingDemocracy': true
        })
    })

    app.post('/v1/authenticate', function(req, res) {
        getFacebookUserInfo(req.body.facebookToken, function(valid, info) {
            if (valid && info) {
                redis.hget(redisKeys.facebookUserIdToUserIden, info.id, function(err, reply) {
                    if (err) {
                        res.sendStatus(500)
                        console.error(err)
                    } else if (reply) {
                        var userIden = reply
                        redis.hget(redisKeys.userIdenToAccessToken, userIden, function(err, reply) {
                            if (err) {
                                res.sendStatus(500)
                                console.error(err)
                            } else if (reply) {
                                res.json({
                                    'accessToken': reply
                                })
                            } else {
                                res.sendStatus(500)
                                console.error('entry for ' + userIden + ' missing in ' + redisKeys.userIdenToAccessToken)
                            }
                        })
                    } else {
                        var user = {
                            'iden': generateIden(),
                            'facebookId': info.id,
                            'name': info.name,
                            'email': info.email
                        }

                        var accessToken = crypto.randomBytes(64).toString('hex')

                        var tasks = []
                        tasks.push(function(callback) {
                            redis.hset(redisKeys.users, user.iden, JSON.stringify(user), function(err, reply) {
                                callback(err, reply)
                            })
                        })
                        tasks.push(function(callback) {
                            redis.hset(redisKeys.userIdenToAccessToken, user.iden, accessToken, function(err, reply) {
                                callback(err, reply)
                            })
                        })
                        tasks.push(function(callback) {
                            redis.hset(redisKeys.accessTokenToUserIden, accessToken, user.iden, function(err, reply) {
                                callback(err, reply)
                            })
                        })
                        tasks.push(function(callback) { // This must come last (order matters in case something fails)
                            redis.hset(redisKeys.facebookUserIdToUserIden, info.id, user.iden, function(err, reply) {
                                callback(err, reply)
                            })
                        })

                        async.series(tasks, function(err, results) { // Must be series since order matters
                            if (err) {
                                res.sendStatus(500)
                                console.error(err)
                            } else {
                                res.json({
                                    'accessToken': accessToken
                                })
                            }
                        })
                    }
                })
            } else {
                res.sendStatus(400)
            }
        })
    })

    app.post('/v1/set-card', function(req, res) {
        if (!req.body.cardToken) {
            res.sendStatus(400)
            return
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
                        res.sendStatus(500)
                        console.error(err)
                    } else {
                        res.sendStatus(200)
                    }
                })
            } else {
                stripe.customers.create({
                    'source': req.body.cardToken,
                    'description': req.user.iden,
                }, function(err, customer) {
                    req.user.hasCard = true

                    var tasks = []
                    tasks.push(function(callback) {
                        redis.hset(redisKeys.userIdenToStripeCustomerId, req.user.iden, customer.id, function(err, reply) {
                            callback(err, reply)
                        })
                    })
                    tasks.push(function(callback) {
                        redis.hset(redisKeys.users, req.user.iden, JSON.stringify(req.user), function(err, reply) {
                            callback(err, reply)
                        })
                    })

                    async.parallel(tasks, function(err, results) {
                        if (err) {
                            res.sendStatus(500)
                            console.error(err)
                        } else {
                            res.sendStatus(200)
                        }
                    })
                })
            }
        })
    })
}

var getFacebookUserInfo = function(facebookToken, callback) {
    var appIdAndSecret = '980119325404337|55224c68bd1df55da4bcac85dc879906'
    var url = 'https://graph.facebook.com/v2.5/debug_token?access_token=' + appIdAndSecret + '&input_token=' + facebookToken
    request.get(url, function(err, res, body) {
        if (res.statusCode == 200) {
            if (JSON.parse(body).data.is_valid) {
                var url = 'https://graph.facebook.com/v2.5/me?fields=id,name,email&access_token=' + facebookToken
                request.get(url, function(err, res, body) {
                    if (res.statusCode == 200) {
                        callback(true, JSON.parse(body))
                    } else {
                        callback(false)
                    }
                })
                return
            }
        }
        callback(false)
    })
}

var generateIden = function() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}
