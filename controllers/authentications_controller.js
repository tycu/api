'use strict'

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require("fs");
var env = process.env.NODE_ENV || "development";
var config = require('../config/session.json')[env];
var uuid = require('uuid');

module.exports = function(app, redis) {
  var models = require('../models/index.js');

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // NOTE trust first proxy
  }

  passport.use(new LocalStrategy({
      usernameField: 'email',
      session: true,
      passReqToCallback: true
    }, function(req, email, password, done) {
      models.User.findOne({where: { email: email }}).then(function(user, err) {
        if (!user) {
          models.User.build({
            email: email,
            loginCount: 1,
            failedLoginCount: 0,
            lastLoginAt: new Date(),
            currentLoginAt: new Date()
          })
          .setPassword(password, function(newUser) {
            newUser.save(function(err) {
              if (err) { throw err;   }
              return done(null, newUser);
            }).then(function(user) {
              return done(null, user);
            })
          })
        } else if (err) {
          console.log('error finding user', err);
        } else {
          user.verifyPassword(password, function(err, result) {
            if ( err || !result ) {
              return done(null, false, { message: 'Incorrect password.' });
            } else {
              return done(null, user);
            }
          });
        }
      });
    })
  );

  // NOTE Serialize authenticated user into the request so they can access callback functions, may have to add more stuff here
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    models.User.findOne({where: { id: id }}, function(user, err) {
      if (err) { return done(err); }
      done(null, user);
    });
  });

  // NOTE order is important
  app.use(morgan('dev')); // log every request to the console
  app.use(cookieParser()); // read cookies (needed for auth)
  app.use(bodyParser.json()); // get information from html forms
  app.use(bodyParser.urlencoded({ extended: true }));

  var sess = {
    cookie: {
      maxAge: config.maxAge
    },
    secret: config.secret,
    name: config.name,
    resave: config.resave,
    saveUninitialized: config.saveUninitialized,
    secure: config.secure,
    path: config.path,
    httpOnly: config.httpOnly,
    store: new RedisStore({client: redis}),
    rolling: false,
    genid: function(req) {
      return uuid.v4();
    }
  }
  // https://github.com/expressjs/session#options
  app.use(session(sess)); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions

  app.post('/v1/login', function(req, res, next) {
    passport.authenticate('local', function (err, user) {
      req.logIn(user, function() {
        res.status(err ? 500 : 200).send(err ? err : {"message": "Successful signin", "sessionID": req.sessionID});
      });
    })(req, res, next)
  });

  app.post('/v1/signup',
    passport.authenticate('local'),
    function(req, res) {
      res.json({"message": "Successful signup", "sessionID": req.sessionID});
  });

}
