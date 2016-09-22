"use strict";

const debug = require('debug')('controllers:facebook_controller:' + process.pid),
      Router = require("express").Router,
      models = require('../models/index.js'),
      env = process.env.NODE_ENV || "development",
      oauthConfig = require('../config/oauthConfig')[env],
      tokenUtils = require("../services/tokenUtils.js"),
      userMailer = require("../mailers/user_mailer"),
      crypto = require('crypto'),
      colorTypes = require('../models/enums/colorTypes'),
      resetConfig = require('../config/resetConfig.json')[env],
      SequelizeError = require("../errors/SequelizeError.js"),
      // Authorize = require("../services/Authorize.js"),
      attributesToLoad = [
        'id',
        'facebookUuid',
        'occupation',
        'employer',
        'name',
        'streetAddress',
        'city',
        'residenceState',
        'zip'
      ];


const loadUser = function(req) {
  const userId = req.params.id;
  debug("userId: %s", userId);

  return models.User.findOne({
    attributes: attributesToLoad,
    where: { id: userId }
  });
}

const generateSingleUseToken = function(email, next) {
  const cipher = crypto.createCipher('aes256', resetConfig.verifyReset),
        encrypted = cipher.update(email, 'utf8', 'hex') + cipher.final('hex');
  return next(encrypted);
};



const authorizeFacebook = function(req, res, next) {
  debug('below authorizeFacebook');

  debug('req.body.fbResponse');
  debug(req.body.fbResponse);
  const fbResponse = req.body.fbResponse;



  process.nextTick(function() {
    models.User.findOne({ where: {'facebookUuid': fbResponse.id} })
    .then(function(existingUser, err) {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        // NOTE do not create new user, just keep data current
        existingUser.email = fbResponse.email;
        existingUser.refreshToken = fbResponse.accessToken;
        existingUser.name = fbResponse.name;
        existingUser.loginCount += 1;
        existingUser.lastLoginAt = existingUser.currentLoginAt;
        existingUser.currentLoginAt = new Date();
        existingUser.lastLoginIp = existingUser.currentLoginIp;
        existingUser.currentLoginIp = req.connection.remoteAddress;
        existingUser.picSquare = fbResponse.picture.data.url;

        existingUser.save(function(err) {
          if (err) { throw err; }
        })
        .then(function(existingUser) {
          debug("User authenticated, generating token");
          tokenUtils.create(existingUser, req, res, next);
          // return next();
        })
      }
      else {
        generateSingleUseToken(fbResponse.email, function(encrypted) {
          const newUser = models.User.build({
            // email: email,
            email: fbResponse.email,
            loginCount: 1,
            facebookUuid: fbResponse.id,
            refreshToken: fbResponse.accessToken,
            failedLoginCount: 0,
            color: 'undecided',
            colorType: colorTypes.get('undecided').value,
            role: 'user',
            lastLoginAt: new Date(),
            currentLoginAt: new Date(),
            cryptedPassword: '',
            currentLoginIp: req.connection.remoteAddress,
            picSquare: fbResponse.picture.data.url,
            singleUseToken: encrypted,
            name: fbResponse.name
          });
          newUser.save(function(newUser, err) {
            debug('saving new user');

            debug(newUser);
            debug(err);

            if (newUser) {
              throw newUser;
            }
            if (err) {
              throw err;
            }
          })
          .catch(function(err, newUser){
            return next(new SequelizeError("422", {message: err}));
          })
          .then(function(newUser, err) {
            debug("New user created, generating token");
            debug(err);
            tokenUtils.create(newUser, req, res, next);

            userMailer.sendWelcomeMail(newUser, function(error, response) {
              debug("confirm sendWelcomeMail response:");
              debug(response);
              next(err, newUser);
            });
          });
        });
      }
    })
  })
}


const deauthorizeFacebook = function(req, res, next) {
  debug('deauthorizeFacebook');
  // TODO setup
}



module.exports = function() {
  const router = new Router();



  router.route("/auth/facebook/callback")
  .post(authorizeFacebook, function(req, res, next) {
    debug('in POST /auth/facebook/callback');
    return res.status(200).json(req.currentUser);
  })

  // NOTE need to add long facebook auth
  // NOTE need to add deauthorize facebook

  // see old_controllers_to_cut/facebook_cut

  return router;
};
