const async = require("async"),
      request = require('request'),
      crypto = require('crypto'),
      redisKeys = require('../redis-keys'),
      debug = require('debug')('controllers:facebook_controller:' + process.pid);


const getFacebookUserInfo = function(facebookToken, callback) {
  const appIdAndSecret = '980119325404337|55224c68bd1df55da4bcac85dc879906';
  const url = 'https://graph.facebook.com/v2.5/debug_token?access_token=' + appIdAndSecret + '&input_token=' + facebookToken;
  request.get(url, function(err, res, body) {
    if (res.statusCode == 200) {
      if (JSON.parse(body).data.is_valid) {
        const url = 'https://graph.facebook.com/v2.5/me?fields=id,name,email&access_token=' + facebookToken;
        request.get(url, function(err, res, body) {
          if (res.statusCode == 200) {
            callback(true, JSON.parse(body));
          } else {
            callback(false);
          }
        });
        return;
      }
    }
    callback(false);
  });
};



module.exports = function(app, redis) {
  // facebook stuff
  app.post('/v1/authenticate', function(req, res) {
    getFacebookUserInfo(req.body.facebookToken, function(valid, info) {
        if (valid && info) {
          redis.hget(redisKeys.facebookUserIdToUserIden, info.id, function(err, reply) {
            if (err) {
              res.sendStatus(500);
              debug(err);
            } else if (reply) {
              const userIden = reply;
              redis.hget(redisKeys.userIdenToAccessToken, userIden, function(err, reply) {
                if (err) {
                  res.sendStatus(500);
                  debug(err);
                } else if (reply) {
                  res.json({
                    'accessToken': reply
                  });
                } else {
                  res.sendStatus(500);
                  debug('entry for ' + userIden + ' missing in ' + redisKeys.userIdenToAccessToken);
                }
              });
            } else { // New user
            const now = Date.now() / 1000;

            const user = {
              // TODO id will auto generate in postgres
              // 'iden': entities.generateIden(),

              'facebookId': info.id,
              'name': info.name,
              'email': info.email,
              'created': now,
              'modified': now
            };

            const accessToken = crypto.randomBytes(64).toString('hex');

            const tasks = [];
            tasks.push(function(callback) {
              redis.hset(redisKeys.users, user.iden, JSON.stringify(user), function(err, reply) {
                callback(err, reply);
              });
            });
            tasks.push(function(callback) {
              redis.hset(redisKeys.userIdenToAccessToken, user.iden, accessToken, function(err, reply) {
                callback(err, reply);
              });
            });
            tasks.push(function(callback) {
              redis.hset(redisKeys.accessTokenToUserIden, accessToken, user.iden, function(err, reply) {
                callback(err, reply);
              });
            });
            tasks.push(function(callback) { // This must come last (order matters in case something fails)
              redis.hset(redisKeys.facebookUserIdToUserIden, info.id, user.iden, function(err, reply) {
                callback(err, reply);
              });
            });

            async.series(tasks, function(err) { // Must be series since order matters // (err, results)
              if (err) {
                res.sendStatus(500);
                debug(err);
              } else {
                res.json({
                  'accessToken': accessToken
                });
              }
            });
          }
        });
      } else {
        res.sendStatus(400);
      }
    });
  });
};
