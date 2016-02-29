var workers = process.env.WEB_CONCURRENCY || 1
var port = process.env.PORT || 5000

var start = function() {
    var express = require('express')
    var app = express()
    var async = require("async")
    var request = require('request')
    var crypto = require('crypto')

    var gcloud = require('gcloud')({
        'projectId': 'tally-us',
        'keyFilename': 'tally-api-service-account.json'
    })

    var redis
    if (process.env.REDISCLOUD_URL) {
        redis = require("redis").createClient(process.env.REDISCLOUD_URL, { 'no_ready_check': true })
    } else {
        redis = require("redis").createClient()
    }

    var keys = {}
    keys.events = 'events'
    keys.politicians = 'politicians'
    keys.pacs = 'pacs'
    keys.reverseChronologicalEvents = 'reverse_chronological_events'
    keys.politicianReverseChronologicalEvents = function(iden) {
        return 'politician_reverse_chronological_events_' + iden
    }
    keys.tokenToUserIden = 'token_to_user_iden'
    keys.userIdenToToken = 'user_iden_to_token'
    keys.facebookUserIdToUserIden = 'facebook_user_id_to_user_iden'
    keys.users = 'users'

    var baseImageUrl = 'https://tally.imgix.net'

    var adminKey = 'btxc21dRkHj9aauM9a4lXOxiuNoENtve'

    // -----------------------------------------------------------------------------

    if (process.env.NODE_ENV == 'production') {
        app.use(function(req, res, next) {
            if (req.headers['x-forwarded-proto'] !== 'https') {
                res.redirect(301, ['https://', req.get('Host'), req.url].join(''))
            } else {
                next()
            }
        })
    }

    app.use(require('cors')())

    app.use(require('body-parser').json())

    app.use(function(req, res, next) {
        if (req.body) {
            // Remove empty strings and null keys
            Object.keys(req.body).forEach(function(key) {
                if (!req.body[key]) {
                    delete req.body[key]
                }
            })
        }
        next()
    })

    app.use(function(req, res, next) {
        if (req.headers.authorization) {
            var parts = req.headers.authorization.split(' ')
            if (parts.length == 2 && parts[0] == 'Bearer') {
                req.token = parts[1]
                if (req.token == adminKey) {
                    next()
                } else {
                    redis.hget(keys.tokenToUserIden, req.token, function(err, reply) {
                        if (err) {
                            res.sendStatus(500)
                        } else if (reply) {
                            redis.hget(keys.users, reply, function(err, reply) {
                                if (err) {
                                    res.sendStatus(500)
                                } else if (reply) {
                                    req.user = JSON.parse(reply)
                                    next()
                                } else {
                                    res.sendStatus(500)
                                    console.error('entry for ' + userIden + ' missing in ' + keys.users)
                                }
                            })
                        } else {
                            res.sendStatus(401)
                        }
                    })
                }
            } else {
                res.sendStatus(401)
            }
        } else {
            next()
        }
    })

    app.get('/', function(req, res) {
        res.json({
            'revitalizingDemocracy': true
        })
    })

    app.post('/v1/tokens', function(req, res) {
        verifyFacebookAccessToken(req.body.facebookAccessToken, function(valid) {
            if (valid) {
                getFacebookUserInfo(req.body.facebookAccessToken, function(info) {
                    if (info) {
                        redis.hget(keys.facebookUserIdToUserIden, info.id, function(err, reply) {
                            if (err) {
                                res.sendStatus(500)
                            } else if (reply) {
                                var userIden = reply
                                redis.hget(keys.userIdenToToken, userIden, function(err, reply) {
                                    if (err) {
                                        res.sendStatus(500)
                                    } else if (reply) {
                                        res.json({
                                            'token': reply
                                        })
                                    } else {
                                        res.sendStatus(500)
                                        console.error('entry for ' + userIden + ' missing in ' + keys.userIdenToToken)
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

                                tasks = []
                                tasks.push(function(callback) {
                                    redis.hset(keys.users, user.iden, JSON.stringify(user), function(err, reply) {
                                        callback(err, reply)
                                    })
                                })
                                tasks.push(function(callback) {
                                    redis.hset(keys.userIdenToToken, user.iden, token, function(err, reply) {
                                        callback(err, reply)
                                    })
                                })
                                tasks.push(function(callback) {
                                    redis.hset(keys.tokenToUserIden, token, user.iden, function(err, reply) {
                                        callback(err, reply)
                                    })
                                })
                                tasks.push(function(callback) { // This must come last (order matters in case something fails)
                                    redis.hset(keys.facebookUserIdToUserIden, info.id, user.iden, function(err, reply) {
                                        callback(err, reply)
                                    })
                                })

                                async.series(tasks, function(err, results) {
                                    if (err) {
                                        res.sendStatus(500)
                                    } else {
                                        res.json({
                                            'token': token
                                        })
                                    }
                                })
                            }
                        })
                    } else {
                        res.sendStatus(500)
                    }
                })
            } else {
                res.sendStatus(400)
            }
        })
    })

    app.get('/v1/users/me', function(req, res) {
        res.json(req.user)
    })

    app.get('/v1/events', function(req, res) {
        var sort = req.query.sort
        var start = req.query.start || 0
        if (sort == 'top') {
            res.json({
                'events': []
            })
        } else {
            redis.lrange(keys.reverseChronologicalEvents, start, 9, function(err, reply) {
                getEvents(reply, function(err, events) {
                    if (err) {
                        res.sendStatus(500)
                    } else {
                        res.json({
                            'events': events
                        })
                    }
                })
            })
        }
    })

    app.post('/v1/events', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        var now = Date.now() / 1000
        req.body.created = now
        req.body.modified = now
        req.body.iden = generateIden()

        if (!isValidEvent(req.body)) {
            res.sendStatus(400)
            return
        }

        var tasks = []
        tasks.push(function(callback) {
            redis.hset(keys.events, req.body.iden, JSON.stringify(req.body), function(err, reply) {
                callback(err, reply)
            })
        })
        tasks.push(function(callback) {
            redis.lpush(keys.reverseChronologicalEvents, req.body.iden, function(err, reply) {
                callback(err, reply)
            })
        })

        async.series(tasks, function(err, results) {
            if (err) {
                res.sendStatus(500)
            } else {
                res.json(req.body)

                // Add this event to the politician's chronological event list
                updatePoliticianReverseChronologicalEvents(req.body, function(err, reply) {
                    if (err) {
                        console.error('failed to add event ' + req.body.iden + ' to politician ' + req.body.politician + ' reverse chronological events')
                    }
                })
            }
        })
    })

    app.get('/v1/events/:iden', function(req, res) {
        getEvent(req.params.iden, function(err, event) {
            if (err) {
                res.sendStatus(500)
            } else if (event) {
                res.json(event)
            } else {
                res.sendStatus(404)
            }
        })
    })

    app.post('/v1/events/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        getEvent(req.params.iden, function(err, event) {
            if (err) {
                res.sendStatus(500)
            } else if (event) {
                var now = Date.now() / 1000
                req.body.modified = now
                req.body.iden = req.params.iden

                if (!isValidEvent(req.body)) {
                    res.sendStatus(400)
                    return
                }

                redis.hset(keys.events, req.params.iden, JSON.stringify(req.body), function(err, reply) {
                    if (err) {
                        res.sendStatus(500)
                    } else {
                        res.json(req.body)

                        // Update the current politician's reverse chronological events list
                        updatePoliticianReverseChronologicalEvents(req.body, function(err, reply) {
                            if (err) {
                                console.error('failed to update event ' + req.body.iden + ' to politician ' + req.body.politician + ' reverse chronological events')
                            }
                        })

                        // If this event used to be attached to a different politician, remove it
                        if (event.politician && event.politician.iden != req.body.politician) {
                            removeFromPoliticianReverseChronologicalEvents(event, function(err, reply) {
                                if (err) {
                                    console.error('failed to remove event ' + req.body.iden + ' from politician ' + req.body.politician + ' reverse chronological events')
                                }
                            })
                        }
                    }
                })
            } else {
                res.sendStatus(404)
            }
        })
    })

    app.delete('/v1/events/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        getEvent(req.params.iden, function(err, event) {
            if (err) {
                res.sendStatus(500)
            } else if (event) {
                var tasks = []
                tasks.push(function(callback) {
                    removeFromPoliticianReverseChronologicalEvents(event, function(err, reply) {
                        callback(err, reply)
                    })
                })
                tasks.push(function(callback) {
                    redis.hdel(keys.events, event.iden, function(err, reply) {
                        callback(err, reply)
                    })
                })
                tasks.push(function(callback) {
                    redis.lrem(keys.reverseChronologicalEvents, 0, req.params.iden, function(err, reply) {
                        callback(err, reply)
                    })
                })

                async.parallel(tasks, function(err, results) {
                    if (err) {
                        res.sendStatus(500)
                    } else {
                        res.json({})
                    }
                })
            } else {
                res.sendStatus(404)
            }
        })
    })

    app.get('/v1/politicians', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        redis.hgetall(keys.politicians, function(err, reply) {
            if (err) {
                res.sendStatus(500)
            } else {
                var politicians = []
                if (reply) {
                    Object.keys(reply).forEach(function(iden) {
                        politicians.push(JSON.parse(reply[iden]))
                    })
                }

                res.json({
                    'politicians': sortByName(politicians)
                })
            }
        })
    })

    app.post('/v1/politicians', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        var now = Date.now() / 1000
        req.body.created = now
        req.body.modified = now
        req.body.iden = generateIden()

        if (!isValidPolitician(req.body)) {
            res.sendStatus(400)
            return
        }

        redis.hset(keys.politicians, req.body.iden, JSON.stringify(req.body), function(err, reply) {
            if (err) {
                res.sendStatus(500)
            } else {
                res.json(req.body)
            }
        })
    })

    app.get('/v1/politicians/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        getPolitician(req.params.iden, function(err, politician) {
            if (err) {
                res.sendStatus(500)
            } else if (politician) {
                res.json(politician)
            } else {
                res.sendStatus(404)
            }
        })
    })

    app.post('/v1/politicians/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        getPolitician(req.params.iden, function(err, politician) {
            if (err) {
                res.sendStatus(500)
            } else if (politician) {
                var now = Date.now() / 1000
                req.body.modified = now
                req.body.iden = req.params.iden

                if (!isValidPolitician(req.body)) {
                    res.sendStatus(400)
                    return
                }

                redis.hset(keys.politicians, req.params.iden, JSON.stringify(req.body), function(err, reply) {
                    if (err) {
                        res.sendStatus(500)
                    } else {
                        res.json(req.body)
                    }
                })
            } else {
                res.sendStatus(404)
            }
        })
    })

    app.get('/v1/politicians/:iden/events', function(req, res) {
        var key = keys.politicianReverseChronologicalEvents(req.params.iden)
        var start = req.query.start || 0
        redis.zrange(key, start, 9, function(err, reply) {
            getEvents(reply, function(err, events) {
                if (err) {
                    res.sendStatus(500)
                } else {
                    res.json({
                        'events': events
                    })
                }
            })
        })
    })

    app.get('/v1/pacs', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        redis.hgetall(keys.pacs, function(err, reply) {
            if (err) {
                res.sendStatus(500)
            } else {
                var pacs = []
                if (reply) {
                    Object.keys(reply).forEach(function(iden) {
                        pacs.push(JSON.parse(reply[iden]))
                    })
                }

                res.json({
                    'pacs': sortByName(pacs)
                })
            }
        })
    })

    app.post('/v1/pacs', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        var now = Date.now() / 1000
        req.body.created = now
        req.body.modified = now
        req.body.iden = generateIden()

        if (!isValidPac(req.body)) {
            res.sendStatus(400)
            return
        }

        redis.hset(keys.pacs, req.body.iden, JSON.stringify(req.body), function(err, reply) {
            if (err) {
                res.sendStatus(500)
            } else {
                res.json(req.body)
            }
        })
    })

    app.get('/v1/pacs/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        getPac(req.params.iden, function(err, pac) {
            if (err) {
                res.sendStatus(500)
            } else if (pac) {
                res.json(pac)
            } else {
                res.sendStatus(404)
            }
        })
    })

    app.post('/v1/pacs/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        getPac(req.params.iden, function(err, pac) {
            if (err) {
                res.sendStatus(500)
            } else if (pac) {
                var now = Date.now() / 1000
                req.body.modified = now
                req.body.iden = req.params.iden

                if (!isValidPac(req.body)) {
                    res.sendStatus(400)
                    return
                }

                redis.hset(keys.pacs, req.params.iden, JSON.stringify(req.body), function(err, reply) {
                    if (err) {
                        res.sendStatus(500)
                    } else {
                        res.json(req.body)
                    }
                })
            } else {
                res.sendStatus(404)
            }
        })
    })

    app.get('/v1/donations', function(req, res) {

    })

    app.post('/v1/donations', function(req, res) {

    })

    app.get('/v1/scoreboards/weekly', function(req, res) {
        res.json({})
    })

    app.get('/v1/scoreboards/monthly', function(req, res) {
        res.json({})
    })

    app.get('/v1/scoreboards/all-time', function(req, res) {
        res.json({})
    })

    // -----------------------------------------------------------------------------

    app.post('/internal/upload-image', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403)
            return
        }

        var fileTypeExtensions = {
            'image/jpeg': '.jpg',
            'image/png': '.png'
        }

        var extension = fileTypeExtensions[req.query.fileType]
        if (!extension) {
            res.sendStatus(400)
            return
        }

        var fileName = generateIden() + extension

        var bucket = gcloud.storage().bucket('static.tally.us');
        var file = bucket.file('images/' + fileName);

        req.pipe(file.createWriteStream({
            'metadata': {
                'contentType': 'image/jpeg'
            }
        })).on('error', function(e) {
            res.sendStatus(500)
        }).on('finish', function() {
            res.status(200).json({
                'imageUrl': baseImageUrl + '/images/' + fileName
            })
        })
    })

    // -----------------------------------------------------------------------------

    app.listen(port, function() {
        console.log('tally-api listening on port ' + port)
    })

    // -----------------------------------------------------------------------------

    var generateIden = function() {
        return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
    }

    var getEvent = function(iden, callback) {
        redis.hget(keys.events, iden, function(err, reply) {
            if (err) {
                callback(err)
            } else if (reply) {
                var event = JSON.parse(reply)
                getPolitician(event.politician, function(err, politician) {
                    if (err) {
                        callback(err)
                    } else {
                        if (politician) {
                            event.politician = politician
                        }
                        callback(null, event)
                    }
                })
            } else {
                callback()
            }
        })
    }

    var getEvents = function(idens, callback) {
        var tasks = []
        if (idens) {
            idens.forEach(function(iden) {
                tasks.push(function(callback) {
                    getEvent(iden, function(err, event) {
                        callback(err, event)
                    })
                })
            })
        }

        async.parallel(tasks, function(err, results) {
            callback(err, results)
        })
    }

    var getPolitician = function(iden, callback) {
        redis.hget(keys.politicians, iden, function(err, reply) {
            if (err) {
                callback(err)
            } else if (reply) {
                callback(null, JSON.parse(reply))
            } else {
                callback()
            }
        })
    }

    var getPac = function(iden, callback) {
        redis.hget(keys.pacs, iden, function(err, reply) {
            if (err) {
                callback(err)
            } else if (reply) {
                callback(null, JSON.parse(reply))
            } else {
                callback()
            }
        })
    }

    var updatePoliticianReverseChronologicalEvents = function(event, callback) {
        if (event.politician) {
            var key = keys.politicianReverseChronologicalEvents(event.politician)
            redis.zadd(key, -event.created, event.iden, function(err, reply) {
                callback(err, reply)
            })
        }
    }

    var removeFromPoliticianReverseChronologicalEvents = function(event, callback) {
        if (event.politician) {
            var key = keys.politicianReverseChronologicalEvents(event.politician.iden)
            redis.zrem(key, event.iden, function(err, reply) {
                callback(err, reply)
            })
        }
    }

    var isValidIdentity = function(entity) {
        return entity.iden && entity.created && entity.modified
    }

    var isValidPolitician = function(politician) {
        if (!isValidIdentity(politician)) {
            return false
        }
        if (politician.thumbnailUrl && politician.thumbnailUrl.indexOf(baseImageUrl) != 0) {
            return false
        }
        return true
    }

    var isValidEvent = function(event) {
        if (!isValidIdentity(event)) {
            return false
        }
        return true
    }

    var isValidPac = function(pac) {
        if (!isValidIdentity(pac)) {
            return false
        }
        return true
    }

    var sortByName = function(items) {
        return items.sort(function(a, b) {
            if (a.name > b.name) {
                return 1
            } else if (a.name < b.name) {
                return -1
            } else {
                return 0
            }
        })
    }

    var verifyFacebookAccessToken = function(accessToken, callback) {
        var appIdAndSecret = '980119325404337|55224c68bd1df55da4bcac85dc879906'
        var url = 'https://graph.facebook.com/v2.5/debug_token?access_token=' + appIdAndSecret + '&input_token=' + accessToken
        request.get(url, function(err, res, body) {
            if (res.statusCode == 200) {
                callback(JSON.parse(body).data.is_valid)
            } else {
                callback(false)
            }
        })
    }

    var getFacebookUserInfo = function(accessToken, callback) {
        var url = 'https://graph.facebook.com/v2.5/me?fields=id,name,email&access_token=' + accessToken
        request.get(url, function(err, res, body) {
            if (res.statusCode == 200) {
                callback(JSON.parse(body))
            } else {
                callback()
            }
        })
    }
}

require('throng')(start, {
    'workers': workers,
    'lifetime': Infinity
})
