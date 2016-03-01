'use strict'

var async = require("async")
var request = require('request')
var crypto = require('crypto')
var redisKeys = require('./redis-keys')

module.exports = function(app, redis) {
    app.get('/', function(req, res) {
        res.json({
            'revitalizingDemocracy': true
        })
    })

    app.post('/v1/authenticate', function(req, res) {
        getFacebookUserInfo(req.body.accessToken, function(valid, info) {
            if (valid && info) {
                redis.hget(redisKeys.facebookUserIdToUserIden, info.id, function(err, reply) {
                    if (err) {
                        res.sendStatus(500)
                        console.error(err)
                    } else if (reply) {
                        var userIden = reply
                        redis.hget(redisKeys.userIdenToToken, userIden, function(err, reply) {
                            if (err) {
                                res.sendStatus(500)
                                console.error(err)
                            } else if (reply) {
                                res.json({
                                    'token': reply
                                })
                            } else {
                                res.sendStatus(500)
                                console.error('entry for ' + userIden + ' missing in ' + redisKeys.userIdenToToken)
                            }
                        })
                    } else {
                        var user = {
                            'iden': generateIden(),
                            'facebookId': info.id,
                            'name': info.name,
                            'email': info.email
                        }

                        var token = crypto.randomBytes(64).toString('hex');

                        var tasks = []
                        tasks.push(function(callback) {
                            redis.hset(redisKeys.users, user.iden, JSON.stringify(user), function(err, reply) {
                                callback(err, reply)
                            })
                        })
                        tasks.push(function(callback) {
                            redis.hset(redisKeys.userIdenToToken, user.iden, token, function(err, reply) {
                                callback(err, reply)
                            })
                        })
                        tasks.push(function(callback) {
                            redis.hset(redisKeys.tokenToUserIden, token, user.iden, function(err, reply) {
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
                                    'token': token
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

    app.post('/v1/get-profile', function(req, res) {
        var user = req.user
        user.donations = []

        res.json(user)
    })
}

var getFacebookUserInfo = function(accessToken, callback) {
    var appIdAndSecret = '980119325404337|55224c68bd1df55da4bcac85dc879906'
    var url = 'https://graph.facebook.com/v2.5/debug_token?access_token=' + appIdAndSecret + '&input_token=' + accessToken
    request.get(url, function(err, res, body) {
        if (res.statusCode == 200) {
            if (JSON.parse(body).data.is_valid) {
                var url = 'https://graph.facebook.com/v2.5/me?fields=id,name,email&access_token=' + accessToken
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
