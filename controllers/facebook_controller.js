var async = require("async")
var request = require('request')
var crypto = require('crypto')
var redisKeys = require('../redis-keys')
var sendgrid  = require('sendgrid')('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')

var stripeTestSecretKey = 'sk_test_rtBOxo0prIIbfVocTi4l1gPC'
var stripeLiveSecretKey = 'sk_live_ENFmtxmEkWjtk9E7a53VF8Kf'


var getFacebookUserInfo = function(facebookToken, callback) {
  var appIdAndSecret = '980119325404337|55224c68bd1df55da4bcac85dc879906';
  var url = 'https://graph.facebook.com/v2.5/debug_token?access_token=' + appIdAndSecret + '&input_token=' + facebookToken;
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



module.exports = function(app, redis) {
  // facebook stuff
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
            } else { // New user
            var now = Date.now() / 1000

            var user = {
              'iden': entities.generateIden(),
              'facebookId': info.id,
              'name': info.name,
              'email': info.email,
              'created': now,
              'modified': now
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
}