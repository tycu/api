'use strict'
var fs   = require("fs");
var path = require("path");

var workers = process.env.WEB_CONCURRENCY || 1
var port = process.env.PORT || 5000

var start = function() {
  var express = require('express');
  var app = express();
  var redisKeys = require('./redis-keys');
  // var db = {};
  var redis;
  // var models = require("../models");

  if (process.env.REDISCLOUD_URL) {
    redis = require("redis").createClient(process.env.REDISCLOUD_URL, { 'no_ready_check': true })
  } else {
    redis = require("redis").createClient()
  }

  // Require HTTPS in production
  if (process.env.NODE_ENV == 'production') {
    app.use(function(req, res, next) {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        res.status(403).json({
          'error': {
            'message': 'This server is only accessible over HTTPS.'
          }
        });
      } else {
        next()
      };
    });
  };

  app.use(require('cors')())
  app.use(require('body-parser').json())

  // Patch sendStatus to always send json
  app.use(function(req, res, next) {
    res.sendStatus = function(statusCode) {
      res.status(statusCode).json({})
    }
    next();
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
  });
  require('./endpoints')(app, redis);



  var models = fs.readdirSync('./models');

  require(__dirname + '/models/index.js');

  // var Sequelize = require("sequelize");
  // String.prototype.capitalize = function() {
  //   return this.charAt(0).toUpperCase() + this.slice(1);
  // }

  // // NOTE load models for postgres database
  // fs.readdirSync('./models').filter(function(file) {
  //   return (file.indexOf("./models") !== 0) && (file !== "index.js");
  // }).forEach(function(file) {
  //   require('./config/database.js').init(function(sequelize) {

  //     // console.log(path.join(__dirname, '/models', file));
  //     // var model = sequelize.import(path.join(__dirname, '/models', file));
  //     var model = file.split('.')[0].capitalize();
  //     var whereId = path.join(__dirname, '/models', file)

  //     require(model)(whereId, sequelize);
  //     db[model.name] = sequelize.import(whereId);
  //     Object.keys(db).forEach(function(modelName) {
  //       if (db[modelName].associate) {
  //         db[modelName].associate(db);
  //       }
  //     });

  //     // db.sequelize = sequelize;
  //     db.Sequelize = Sequelize;

  //   });
  // });

  // module.exports = db;


  //{force: true}
  // models.sequelize.sync().then(function () {
    app.listen(port, function() {
      console.log('SUCCESS: tally-api listening on port ' + port)
    })
  // });
}

require('throng')(start, {
  'workers': workers,
  'lifetime': Infinity
});
