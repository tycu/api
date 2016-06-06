'use strict'

var workers = process.env.WEB_CONCURRENCY || 1
var port = process.env.PORT || 5000

var start = function() {
    var express = require('express')
    var app = express()
    var redisKeys = require('./redis-keys')

    var redis
    if (process.env.REDISCLOUD_URL) {
        redis = require("redis").createClient(process.env.REDISCLOUD_URL, { 'no_ready_check': true })
    } else {
        redis = require("redis").createClient()
    }

    // -----------------------------------------------------------------------------

    // Require HTTPS in production
    // if (process.env.NODE_ENV == 'production') {
    //     app.use(function(req, res, next) {
    //         if (req.headers['x-forwarded-proto'] !== 'https') {
    //             res.status(403).json({
    //                 'error': {
    //                     'message': 'This server is only accessible over HTTPS.'
    //                 }
    //             })
    //         } else {
    //             next()
    //         }
    //     })
    // }

    app.use(require('cors')())

    app.use(require('body-parser').json())

    // Patch sendStatus to always send json
    app.use(function(req, res, next) {
        res.sendStatus = function(statusCode) {
            res.status(statusCode).json({})
        }
        next()
    })

    // If the authorization header is present, verify the token and set req.user
    app.use(function(req, res, next) {
        if (!req.headers.authorization) {
            if (req.url == '/' || req.url == '/v1/authenticate') {
                next()
            } else {
                res.sendStatus(401)
            }
            return
        }

        var parts = req.headers.authorization.split(' ')
        if (parts.length == 2 && parts[0] == 'Bearer') {
            var token = parts[1]
            redis.hget(redisKeys.accessTokenToUserIden, token, function(err, reply) {
                if (err) {
                    res.sendStatus(500)
                    console.error(err)
                } else if (reply) {
                    redis.hget(redisKeys.users, reply, function(err, reply) {
                        if (err) {
                            res.sendStatus(500)
                            console.error(err)
                        } else if (reply) {
                            req.user = JSON.parse(reply)
                            next()
                        } else {
                            res.sendStatus(500)
                            console.error('entry for ' + userIden + ' missing in ' + redisKeys.users)
                        }
                    })
                } else {
                    res.sendStatus(401)
                }
            })
        } else {
            res.sendStatus(401)
        }
    })

    require('./endpoints')(app, redis)

    app.listen(port, function() {
        console.log('tally-api listening on port ' + port)
    })
}

require('throng')(start, {
    'workers': workers,
    'lifetime': Infinity
})
