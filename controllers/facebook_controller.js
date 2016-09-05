"use strict";

const debug = require('debug')('controllers:facebook_controller:' + process.pid),
      Router = require("express").Router,
      // passport = require('passport'),
      models = require('../models/index.js'),
      env = process.env.NODE_ENV || "development",
      oauthConfig = require('../config/oauthConfig')[env],
      tokenUtils = require("../services/tokenUtils.js"),
      userMailer = require("../mailers/user_mailer"),
      crypto = require('crypto'),
      resetConfig = require('../config/resetConfig.json')[env],
      // FacebookStrategy = require('passport-facebook').Strategy,
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


  // router.route("/auth/facebook")
  // .get(passport.authenticate('facebook'), function(req, res, next) {
  //   debug('in GET /auth/facebook');
  //   return res.status(200).json(req);
  // });

  router.route("/auth/facebook/callback")
  .post(authorizeFacebook, function(req, res, next) {
    debug('in POST /auth/facebook/callback');
    return res.status(200).json(req.currentUser);
  })

  // NOTE need to add ssl locally
  // http://localhost:5000/api/v1/auth/facebook/deauthorize
  // and add to facebook
  // router.route('/auth/facebook/deauthorize')
  // .post(deauthorizeFacebook, function(req, res, next) {
  //   debug('in POST /auth/facebook/deauthorize');
  //   return res.status(200).json(req.user);
  // })


  return router;
};


// TODO move to long lasting server based access tokens
// https://developers.facebook.com/docs/facebook-login/access-tokens/expiration-and-extension

// const getFacebookUserInfo = function(facebookToken, callback) {
//   const appIdAndSecret = '980119325404337|55224c68bd1df55da4bcac85dc879906';
//   const url = 'https://graph.facebook.com/v2.7/debug_token?access_token=' + appIdAndSecret + '&input_token=' + facebookToken;
//   request.get(url, function(err, res, body) {
//     if (res.statusCode == 200) {
//       if (JSON.parse(body).data.is_valid) {
//         const url = 'https://graph.facebook.com/v2.7/me?fields=id,name,email&access_token=' + facebookToken;
//         request.get(url, function(err, res, body) {
//           if (res.statusCode == 200) {
//             callback(true, JSON.parse(body));
//           } else {
//             callback(false);
//           }
//         });
//         return;
//       }
//     }
//     callback(false);
//   });
// };

