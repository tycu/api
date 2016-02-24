var workers = process.env.WEB_CONCURRENCY || 1;
var port = process.env.PORT || 5000;

var start = function() {
    var express = require('express');
    var app = express();
    var async = require("async");

    var redis;
    if (process.env.REDISCLOUD_URL) {
        redis = require("redis").createClient(process.env.REDISCLOUD_URL, { 'no_ready_check': true });
    } else {
        redis = require("redis").createClient();
    }

    var keys = {};
    keys.events = 'events';
    keys.politicians = 'politicians';
    keys.pacs = 'pacs';
    keys.reverseChronologicalEvents = 'reverse_chronological_events';
    keys.politicianReverseChronologicalEvents = function(iden) {
        return 'politician_reverse_chronological_events_' + iden
    };
    keys.tokenToUserIden = 'token_to_user_iden';
    keys.facebookUserIdToUserIden = 'facebook_user_id_to_user_iden';
    keys.users = 'users';

    var adminKey = 'btxc21dRkHj9aauM9a4lXOxiuNoENtve';

    // -----------------------------------------------------------------------------

    if (process.env.NODE_ENV == 'production') {
        app.use(function(req, res, next) {
            if (req.headers['x-forwarded-proto'] !== 'https') {
                res.redirect(301, ['https://', req.get('Host'), req.url].join(''));
            } else {
                next();
            }
        });
    } else {
        app.use(express.static('internal'));
    }

    app.use(require('cors')());

    app.use(require('body-parser').json());

    app.use(function(req, res, next) {
        if (req.body) {
            // Remove empty strings and null keys
            Object.keys(req.body).forEach(function(key) {
                if (!req.body[key]) {
                    delete req.body[key];
                }
            });
        }
        next();
    });

    app.use(function(req, res, next) {
        if (req.headers.authorization) {
            var parts = req.headers.authorization.split(' ');
            if (parts.length == 2 && parts[0] == 'Bearer') {
                req.token = parts[1];
            }
        }
        next();
    });

    app.get('/', function(req, res) {
        res.json({
            'helloWorld': true
        });
    });

    app.get('/v1/events', function(req, res) {
        var start = req.query.start || 0
        redis.lrange(keys.reverseChronologicalEvents, start, 9, function(err, reply) {
            getEvents(reply, function(err, events) {
                if (err) {
                    res.sendStatus(500);
                } else {
                    res.json({
                        'events': events
                    });
                }
            });
        });
    });

    app.get('/v1/events/:iden', function(req, res) {
        getEvent(req.params.iden, function(err, event) {
            if (err) {
                res.sendStatus(500);
            } else if (event) {
                res.json(event);
            } else {
                res.sendStatus(404);
            }
        });
    });

    app.get('/v1/politicians/:iden/events', function(req, res) {
        var key = keys.politicianReverseChronologicalEvents(req.params.iden);
        var start = req.query.start || 0
        redis.zrange(key, start, 9, function(err, reply) {
            getEvents(reply, function(err, events) {
                if (err) {
                    res.sendStatus(500);
                } else {
                    res.json({
                        'events': events
                    });
                }
            });
        });
    });

    app.post('/v1/tokens', function(req, res) {
        // Confirm facebook authtoken
        // Look up the user iden in the redis hash keyed on the facebook user id
        //     Insert a user if one doesn't already exist for that facebook user id
        //     Map the facebook user id to the user iden for that facebook user id
        //     Map the user's token to the user iden
        // Return the user's token
    });

    app.get('/v1/users/me', function(req, res) {
        // Look up the user that owns the token in the authorization header
        // return the user
    });

    app.get('/v1/donations', function(req, res) {

    });

    app.post('/v1/donations', function(req, res) {

    });

    app.get('v1/scoreboards/top', function(req, res) {

    });

    // -----------------------------------------------------------------------------

    app.post('/v1/events', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        var now = Date.now() / 1000;
        req.body.created = now;
        req.body.modified = now;
        req.body.iden = Math.random().toString(36).slice(2);

        var tasks = [];
        tasks.push(function(callback) {
            redis.hset(keys.events, req.body.iden, JSON.stringify(req.body), function (err, reply) {
                callback(err, reply);
            });
        });
        tasks.push(function(callback) {
            redis.lpush(keys.reverseChronologicalEvents, req.body.iden, function(err, reply) {
                callback(err, reply);
            });
        });

        async.series(tasks, function(err, results) {
            if (err) {
                res.sendStatus(500);
            } else {
                res.json(req.body);

                // Add this event to the politician's chronological event list
                updatePoliticianReverseChronologicalEvents(req.body, function(err, reply) {
                    if (err) {
                        console.error(err)
                    }
                });
            }
        });
    });

    app.post('/v1/events/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        getEvent(req.params.iden, function(err, event) {
            if (err) {
                res.sendStatus(500);
            } else if (event) {
                var now = Date.now() / 1000;
                req.body.modified = now;
                req.body.iden = req.params.iden

                redis.hset(keys.events, req.params.iden, JSON.stringify(req.body), function (err, reply) {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.json(req.body);

                        // Update the current politician's reverse chronological events list
                        updatePoliticianReverseChronologicalEvents(req.body, function(err, reply) {
                            if (err) {
                                console.error(err);
                            }
                        });

                        // If this event used to be attached to a different politician, remove it
                        if (event.politician && event.politician.iden != req.body.politician) {
                            removeFromPoliticianReverseChronologicalEvents(event, function(err, reply) {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }
                    }
                });
            } else {
                res.sendStatus(404);
            }
        });
    });

    app.delete('/v1/events/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        getEvent(req.params.iden, function(err, event) {
            if (err) {
                res.sendStatus(500);
            } else if (event) {
                var tasks = [];
                tasks.push(function(callback) {
                    removeFromPoliticianReverseChronologicalEvents(event, function (err, reply) {
                        callback(err, reply);
                    });
                });
                tasks.push(function(callback) {
                    redis.hdel(keys.events, event.iden, function(err, reply) {
                        callback(err, reply);
                    });
                });
                tasks.push(function(callback) {
                    redis.lrem(keys.reverseChronologicalEvents, 0, req.params.iden, function(err, reply) {
                        callback(err, reply);
                    });
                });

                async.parallel(tasks, function(err, results) {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.status(200).json({});
                    }
                });
            } else {
                res.sendStatus(404);
            }
        });
    });

    app.get('/v1/politicians', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        redis.hgetall(keys.politicians, function(err, reply) {
            if (err) {
                res.sendStatus(500);
            } else {
                var politicians = [];
                if (reply) {
                    Object.keys(reply).forEach(function(iden) {
                        politicians.push(JSON.parse(reply[iden]));
                    });
                }

                res.json({
                    'politicians': sortByName(politicians)
                });
            }
        });
    });

    app.post('/v1/politicians', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        var now = Date.now() / 1000;
        req.body.created = now;
        req.body.modified = now;
        req.body.iden = Math.random().toString(36).slice(2);

        redis.hset(keys.politicians, req.body.iden, JSON.stringify(req.body), function (err, reply) {
            if (err) {
                res.sendStatus(500);
            } else {
                res.json(req.body);
            }
        });
    });

    app.get('/v1/politicians/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        getPolitician(req.params.iden, function(err, politician) {
            if (err) {
                res.sendStatus(500);
            } else if (politician) {
                res.json(politician);
            } else {
                res.sendStatus(404);
            }
        });
    });

    app.post('/v1/politicians/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        getPolitician(req.params.iden, function(err, politician) {
            if (err) {
                res.sendStatus(500);
            } else if (politician) {
                var now = Date.now() / 1000;
                req.body.modified = now;
                req.body.iden = req.params.iden

                redis.hset(keys.politicians, req.params.iden, JSON.stringify(req.body), function (err, reply) {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.json(req.body);
                    }
                });
            } else {
                res.sendStatus(404);
            }
        });
    });

    app.get('/v1/pacs', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        redis.hgetall(keys.pacs, function(err, reply) {
            if (err) {
                res.sendStatus(500);
            } else {
                var pacs = [];
                if (reply) {
                    Object.keys(reply).forEach(function(iden) {
                        pacs.push(JSON.parse(reply[iden]));
                    });
                }

                res.json({
                    'pacs': sortByName(pacs)
                })
            }
        });
    });

    app.post('/v1/pacs', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        var now = Date.now() / 1000;
        req.body.created = now;
        req.body.modified = now;
        req.body.iden = Math.random().toString(36).slice(2);

        redis.hset(keys.pacs, req.body.iden, JSON.stringify(req.body), function (err, reply) {
            if (err) {
                res.sendStatus(500);
            } else {
                res.json(req.body);
            }
        });
    });

    app.get('/v1/pacs/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        getPac(req.params.iden, function(err, pac) {
            if (err) {
                res.sendStatus(500);
            } else if (pac) {
                res.json(pac);
            } else {
                res.sendStatus(404);
            }
        });
    });

    app.post('/v1/pacs/:iden', function(req, res) {
        if (req.token != adminKey) {
            res.sendStatus(403);
            return;
        }

        getPac(req.params.iden, function(err, pac) {
            if (err) {
                res.sendStatus(500);
            } else if (pac) {
                var now = Date.now() / 1000;
                req.body.modified = now;
                req.body.iden = req.params.iden

                redis.hset(keys.pacs, req.params.iden, JSON.stringify(req.body), function (err, reply) {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.json(req.body);
                    }
                });
            } else {
                res.sendStatus(404);
            }
        });
    });

    // -----------------------------------------------------------------------------

    app.listen(port, function() {
        console.log('tally-api listening on port ' + port);
    });

    // -----------------------------------------------------------------------------

    var getEvent = function(iden, callback) {
        redis.hget(keys.events, iden, function(err, reply) {
            if (err) {
                callback(err)
            } else if (reply) {
                var event = JSON.parse(reply);
                getPolitician(event.politician, function(err, politician) {
                    if (err) {
                        callback(err);
                    } else {
                        if (politician) {
                            event.politician = politician;
                        }
                        callback(null, event);
                    }
                });
            } else {
                callback(null, null);
            }
        });
    };

    var getPolitician = function(iden, callback) {
        redis.hget(keys.politicians, iden, function(err, reply) {
            if (err) {
                callback(err);
            } else if (reply) {
                callback(null, JSON.parse(reply));
            } else {
                callback(null, null);
            }
        });
    };

    var getPac = function(iden, callback) {
        redis.hget(keys.pacs, iden, function(err, reply) {
            if (err) {
                callback(err);
            } else if (reply) {
                callback(null, JSON.parse(reply));
            } else {
                callback(null, null);
            }
        });
    };

    var updatePoliticianReverseChronologicalEvents = function(event, callback) {
        if (event.politician) {
            var key = keys.politicianReverseChronologicalEvents(event.politician);
            redis.zadd(key, -event.created, event.iden, function(err, reply) {
                callback(err, reply);
            });
        }
    };

    var removeFromPoliticianReverseChronologicalEvents = function(event, callback) {
        if (event.politician) {
            var key = keys.politicianReverseChronologicalEvents(event.politician.iden);
            redis.zrem(key, event.iden, function(err, reply) {
                callback(err, reply);
            });
        }
    };

    var getEvents = function(idens, callback) {
        var tasks = [];
        if (idens) {
            idens.forEach(function(iden) {
                tasks.push(function(callback) {
                    getEvent(iden, function(err, event) {
                        callback(err, event);
                    });
                });
            });
        }

        async.parallel(tasks, function(err, results) {
            callback(err, results);
        });
    };

    var sortByName = function(items) {
        return items.sort(function(a, b) {
            if (a.name > b.name) {
                return 1;
            } else if (a.name < b.name) {
                return -1;
            } else {
                return 0;
            }
        });
    };
};

require('throng')(start, {
    'workers': workers,
    'lifetime': Infinity
});
