var workers = process.env.WEB_CONCURRENCY || 1;
var port = process.env.PORT || 5000;

var start = function() {
    var express = require('express');
    var app = express();
    var redis = require("redis").createClient();
    var async = require("async");

    var keys = {};
    keys.events = 'events';
    keys.politicians = 'politicians';
    keys.reverseChronologicalEventList = 'reverse_chronological_event_list';
    keys.politicianChronologicalEvents = function(iden) {
        return 'politician_chronological_events_' + iden
    }

    app.use(require('body-parser').json())

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

    app.get('/v1/events', function(req, res) {
        var start = req.query.start || 0
        redis.lrange(keys.reverseChronologicalEventList, start, 9, function(err, reply) {
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

    app.get('/v1/politicians/:iden/events', function(req, res) {
        var key = keys.politicianChronologicalEvents(req.params.iden);
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

    if (process.env.NODE_ENV != 'production') {
        app.post('/v1/events', function(req, res) {
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
                redis.lpush(keys.reverseChronologicalEventList, req.body.iden, function(err, reply) {
                    callback(err, reply);
                });
            });

            async.series(tasks, function(err, results) {
                if (err) {
                    res.sendStatus(500);
                } else {
                    res.json(req.body);

                    // Add this event to the politician's chronological event list
                    updatePoliticianChronologicalEvents(req.body, function(err, reply) {
                        if (err) {
                            console.error(err)
                        }
                    });
                }
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

        app.post('/v1/events/:iden', function(req, res) {
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

                            // Update the current politician's chronological events list
                            updatePoliticianChronologicalEvents(req.body, function(err, reply) {
                                if (err) {
                                    console.error(err)
                                }
                            });

                            // If this event used to be attached to a different politician, remove it
                            if (event.politician && event.politician.iden != req.body.politician) {
                                removeFromPoliticianChronologicalEvents(event, function(err, reply) {
                                    if (err) {
                                        console.error(err)
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
            getEvent(req.params.iden, function(err, event) {
                if (err) {
                    res.sendStatus(500);
                } else if (event) {
                    var tasks = [];
                    tasks.push(function(callback) {
                        removeFromPoliticianChronologicalEvents(event, function (err, reply) {
                            callback(err, reply);
                        });
                    });
                    tasks.push(function(callback) {
                        redis.hdel(keys.events, event.iden, function(err, reply) {
                            callback(err, reply);
                        });
                    });
                    tasks.push(function(callback) {
                        redis.lrem(keys.reverseChronologicalEventList, 0, req.params.iden, function(err, reply) {
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
            redis.hgetall(keys.politicians, function(err, reply) {
                if (err) {
                    res.sendStatus(500);
                } else {
                    var politicians = [];
                    Object.keys(reply).forEach(function(iden) {
                        politicians.push(JSON.parse(reply[iden]));
                    });

                    politicians.sort(function(a, b) {
                        if (a.name > b.name) {
                            return 1;
                        } else if (a.name < b.name) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });

                    res.json({
                        'politicians': politicians
                    })
                }
            });
        });

        app.post('/v1/politicians', function(req, res) {
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

        app.use(express.static('private'));
    }

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

    var updatePoliticianChronologicalEvents = function(event, callback) {
        if (event.politician) {
            var key = keys.politicianChronologicalEvents(event.politician);
            redis.zadd(key, -event.created, event.iden, function(err, reply) {
                callback(err, reply);
            });
        }
    };

    var removeFromPoliticianChronologicalEvents = function(event, callback) {
        if (event.politician) {
            var key = keys.politicianChronologicalEvents(event.politician.iden);
            redis.zrem(key, event.iden, function(err, reply) {
                callback(err, reply);
            });
        }
    }

    var getEvents = function(idens, callback) {
        var tasks = [];
        idens.forEach(function(iden) {
            tasks.push(function(callback) {
                getEvent(iden, function(err, event) {
                    callback(err, event);
                });
            });
        });

        async.parallel(tasks, function(err, results) {
            callback(err, results);
        });
    }
};

require('throng')(start, {
    'workers': workers,
    'lifetime': Infinity
});
