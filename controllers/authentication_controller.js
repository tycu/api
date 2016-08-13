"use strict";

var debug = require('debug')('app:controllers:authentication' + process.pid),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    // bcrypt = require('bcrypt'),
    tokenUtils = require("../services/tokenUtils.js"),
    userMailer = require("../mailers/user_mailer.js"),
    Router = require("express").Router,
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js")),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    jwt = require("express-jwt"),
    models = require('../models/index.js'),
    uuid = require('uuid'),
    crypto = require('crypto'),
    env = process.env.NODE_ENV || "development",
    resetConfig = require('../config/resetConfig.json')[env];


var authenticate = function(req, res, next) {
  debug("Processing authenticate middleware");

  var email = req.body.email,
      password = req.body.password,
      newPassword = req.body.newPassword,
      isPasswordChange = req.url === '/change_password',
      that = this;

  if (_.isEmpty(email) || _.isEmpty(password)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'Invalid email or password'
    }));
  } else if (isPasswordChange && _.isEmpty(newPassword)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'You did not provide a new password'
    }));
  }

  process.nextTick(function () {
    models.User.findOne({where: { email: email }})
    .then(function(existingUser, err) {
      if (err || !existingUser) {
        return next(new UnauthorizedAccessError("401", {
          message: 'Invalid email or password'
        }));
      }
      existingUser.comparePassword(password, function (err, isMatch) {
        if (isMatch && !err) {

          existingUser.loginCount += 1;
          existingUser.lastLoginIp = existingUser.currentLoginIp
          existingUser.currentLoginIp = req.connection.remoteAddress
          existingUser.save(function(err) {
              if (err) { throw err; }
            })
            .then(function(existingUser) {
              if (isPasswordChange) {
                debug("password change path::")
                changePassword(existingUser, newPassword, next);
              } else {
                debug("User authenticated, generating token");
                tokenUtils.create(existingUser, req, res, next);
              }

            })
        } else {
          existingUser.failedLoginCount += 1;
          existingUser.save(function(err) {
              if (err) { throw err; }
            }).then(function(existingUser) {
              return next(new UnauthorizedAccessError("401", {
                message: 'Invalid email or password'
              }));
            })

        }
      });
    })
  });
};

var changePassword = function(existingUser, newPassword, next) {
  debug("Processing changePassword");

  existingUser
  .setPassword(newPassword, function(existingUser, err) {
    existingUser.save(function(newUser, err) {
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
      debug("Password changed successfully");
      debug(err);
      next();
      // tokenUtils.create(newUser, req, res, next);
    });
  });
}

var createUser = function(req, res, next) {
  debug("Processing createUser");

  var email = req.body.email,
      password = req.body.password;

  if (_.isEmpty(email) || _.isEmpty(password)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'Invalid email or password'
    }));
  }

  process.nextTick(function() {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    models.User.findOne({where: { email: email }}).then(
      function(existingUser, err) {
        if (err) {
          return next(new UnauthorizedAccessError("401", {message: err}));
        }
        if (existingUser) {
          return next(new UnauthorizedAccessError("401", {message: 'User already exists'}));
        } else {
          const cipher = crypto.createCipher('aes256', resetConfig.verifyReset);
          const encrypted = cipher.update(email, 'utf8', 'hex') + cipher.final('hex');

          var newUser = models.User.build({
            email: email,
            loginCount: 1,
            failedLoginCount: 0,
            lastLoginAt: new Date(),
            currentLoginAt: new Date(),
            currentLoginIp: req.connection.remoteAddress,
            singleUseToken: encrypted
          })
          .setPassword(password, function(newUser, err) {
            newUser.save(function(newUser, err) {
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
              userMailer.sendConfirmMail(newUser, function(error, response){
                // TODO handle errors
                // debug(error);
                debug("confirm email response");
                debug(response);
              });
          });
        });

        }
      }
    )
  })
}

var verifyEmail = function(req, res, next) {
 debug("Processing verifyEmail");

  var emailConfirmToken = req.query.email_confirm_token;
  // debug("emailConfirmToken %s", emailConfirmToken)
  process.nextTick(function () {

    models.User.findOne({where: { singleUseToken: emailConfirmToken }})
    .then(function(existingUser, err) {
      if (err || !existingUser) {
        return next(new UnauthorizedAccessError("401", {
          message: 'Something went wrong verifying your email. Please Contact us or try signing up again.' // user doesn't exist
        }));
      }
      tokenUtils.verifyEmail(existingUser, req, res, function(existingUser, err) {
        if (err) {
          return next(new UnauthorizedAccessError("401", {
          message: 'Something went wrong verifying your email. Please Contact us or try signing up again.' // user doesn't exist
          }));
        } else {
          // debug("above userMailer.sendWelcomeMail");
          userMailer.sendWelcomeMail(existingUser, function(error, response) {
            debug("welcome email response:");
            debug(response);
            next(err, existingUser)
          })

          existingUser.emailVerified = true;
          existingUser.lastLoginIp = existingUser.currentLoginIp;
          existingUser.currentLoginIp = req.connection.remoteAddress;

          existingUser.save(function(err, existingUser) {
            if (err) {
              throw err;
            } else {
              return true;
            }
          })
        }
      })
    })
  });
}


// NOTE '/api/v1' is trimmed from these routes
module.exports = function () {
  var router = new Router();

  // NOTE this route is not in use currently, but checks that a token is working, can use for refresh perhaps
  router.route("/verify_auth").get(function (req, res, next) {
    tokenUtils.verify_auth(req, res, next);
    return res.status(200).json(req.user);
  });

  router.route("/email_verification").get(verifyEmail, function(req, res, next) {
    debug("in email_verification route")

    return res.status(200).json({
      "message": "User verified."
    });
  });

  router.route("/change_password").put(authenticate, function(req, res, next) {
    debug("in change_password route")
    return res.status(200).json({
      "message": "Password updated successfully."
    });
  });

  router.route("/email_reset").put(function(req, res, next) {
    debug("in email_reset route")


    // find user
    // add SingleUseToken
    // add reset password true flag
    // send user password reset email with hash
    // when click reset password link take to react app
    // this screen should have 2 password fields

    // should submit to api /change_password
    // should verify hash has email
    // should verify that token is correct and reset password is true
    // should update password on user object if inputs match


    return res.status(200).json(req.user);
  });

  router.route("/signout").put(function(req, res, next) {
    if (tokenUtils.expire(req.query.token)) {
      return res.status(200).json({
        "message": "User has been successfully logged out"
      });
    } else {
      return next(new UnauthorizedAccessError("401", {message: 'cannot expire token'}));
    }
  });

  router.route("/signin").post(authenticate, function(req, res, next) {
    return res.status(200).json(req.user);
  });

  router.route("/signup").post(createUser, function(req, res, next) {
    return res.status(200).json(req.user);
  });

  router.unless = require("express-unless");
  return router;
};

debug("Loaded authentication_controller.js routes");
