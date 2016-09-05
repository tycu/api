"use strict";

const debug = require('debug')('app:controllers:authentication' + process.pid),
    _ = require("lodash"),
    path = require('path'),
    tokenUtils = require("../services/tokenUtils.js"),
    userMailer = require("../mailers/user_mailer.js"),
    Router = require("express").Router,
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js")),
    SequelizeError = require(path.join(__dirname, "..", "errors", "SequelizeError.js")),
    models = require('../models/index.js'),
    crypto = require('crypto'),
    env = process.env.NODE_ENV || "development",
    resetConfig = require('../config/resetConfig.json')[env],
    Authorize = require("../services/Authorize.js");


const authenticate = function(req, res, next) {
  debug("Processing authenticate middleware");

  const email = req.body.email,
      password = req.body.password,
      newPassword = req.body.newPassword,
      isPasswordChange = req.url === '/change_password';

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
          existingUser.lastLoginAt = existingUser.currentLoginAt
          existingUser.currentLoginAt = new Date()
          existingUser.loginCount += 1;
          existingUser.lastLoginIp = existingUser.currentLoginIp;
          existingUser.currentLoginIp = req.connection.remoteAddress;
          existingUser.save(function(err) {
            if (err) { throw err; }
          })
          .then(function(existingUser) {
            if (isPasswordChange) {
              debug("password change path::");
              updatePassword(existingUser, newPassword, next);
            } else {
              debug("User authenticated, generating token");
              tokenUtils.create(existingUser, req, res, next);
            }
          });
        } else {
          existingUser.failedLoginCount += 1;
          existingUser.save(function(err) {
            if (err) { throw err; }
          }).then(function(existingUser) {
            return next(new UnauthorizedAccessError("401", {
              message: 'Invalid email or password'
            }));
          });
        }
      });
    });
  });
};

const updatePassword = function(user, newPassword, next) {
  debug("Processing updatePassword");

  user
  .setPassword(newPassword, function(user, err) {
    user.save(function(newUser, err) {
      if (newUser) {
        throw newUser;
      }
      if (err) {
        throw err;
      }
    })
    .catch(function(err, user){
      return next(new SequelizeError("422", {message: err}));
    })
    .then(function(user, err) {
      debug("Password changed successfully");
      userMailer.sendPasswordChangeAlert(user, function(error, response){
        // TODO handle errors
        // debug(error);
        debug("confirm sendPasswordChangeAlert response:");
        debug(response);
      });
      debug(err);
      next();
      // tokenUtils.create(newUser, req, res, next);
    });
  });
};

const generateSingleUseToken = function(email, next) {
  const cipher = crypto.createCipher('aes256', resetConfig.verifyReset),
        encrypted = cipher.update(email, 'utf8', 'hex') + cipher.final('hex');
  return next(encrypted);
};

const createUser = function(req, res, next) {
  debug("Processing createUser");
  const email = req.body.email,
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
          // Initial single use Token before account verified
          generateSingleUseToken(email, function(encrypted) {
            const newUser = models.User.build({
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
                  debug("confirm sendConfirmMail response:");
                  debug(response);
                });
            });
          });

        });
      }
    });
  });
};

const generatePasswordReset = function(req, res, next) {
  debug("Processing generatePasswordReset");
  const email = req.body.email;

  if (_.isEmpty(email)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'You must provide an email address to reset your password.'
    }));
  }

  process.nextTick(function () {
    models.User.findOne({where: { email: email }})
    .then(function(existingUser, err) {
      if (err || !existingUser) {
        debug('in err or no existing user found');
        // NOTE do not alert user if email not found, swallow error
        return next();
      }
      generateSingleUseToken(email, function(encrypted) {
        existingUser.singleUseToken = encrypted;
        existingUser.resetPassword = true;
        existingUser.lastLoginIp = existingUser.currentLoginIp;
        existingUser.currentLoginIp = req.connection.remoteAddress;
        existingUser.save(function(err) {
          if (err) { throw err; }
            throw err;
          })
          .then(function(existingUser) {
            userMailer.sendPasswordResetEmail(existingUser, function(error, response){
              // TODO handle errors
              // debug(error);
              debug("confirm sendPasswordResetEmail response:");
              debug(response);
            });
          });
        });
      });
  });
};

const verifyEmail = function(req, res, next) {
 debug("Processing verifyEmail");
 const isUpdatePassword = (/\/update_password/).test(req.url),
       newPassword = req.body.newPassword,
       emailToken = req.query.single_use_token;

  debug("isUpdatePassword:: %s", isUpdatePassword);
  debug("emailToken %s", emailToken);

  if (isUpdatePassword && _.isEmpty(newPassword)) {
    return next(new UnauthorizedAccessError("401", {
      message: 'New Password Required'
    }));
  }
  process.nextTick(function () {
    models.User.findOne({where: { singleUseToken: emailToken }})
    .then(function(existingUser, err) {
      if (err || !existingUser) {
        return next(new UnauthorizedAccessError("401", {
          message: 'from top::: Something went wrong verifying your email. Please Contact us or try signing up again.' // user doesn't exist
        }));
      }
      tokenUtils.verifyEmail(existingUser, req, res, function(existingUser, err) {
        if (err) {
          return next(new UnauthorizedAccessError("401", {
          message: 'from bottom::: Something went wrong verifying your email. Please Contact us or try signing up again.' // user doesn't exist
          }));
        } else {


          if (isUpdatePassword) {
            if (existingUser.resetPassword === false) {
              return next(new UnauthorizedAccessError("401", {
                message: 'Cannot reset password'
              }));
            }
            updatePassword(existingUser, newPassword, next);
          } else {
            userMailer.sendWelcomeMail(existingUser, function(error, response) {
              debug("confirm sendWelcomeMail response:");
              debug(response);
              next(err, existingUser);
            });

            existingUser.emailVerified = true;
            existingUser.lastLoginIp = existingUser.currentLoginIp;
            existingUser.currentLoginIp = req.connection.remoteAddress;

            existingUser.save(function(err, existingUser) {
              if (err) {
                throw err;
              } else {
                return true;
              }
            });
          }
        }
      });
    });
  });
};


// NOTE '/api/v1' is trimmed from these routes
module.exports = function () {
  const router = new Router();

  router.route("/verify_auth")
  .get(function (req, res, next) {
    tokenUtils.verifyAuth(req, res, next);
  });

  router.route("/update_password")
  .put(verifyEmail, function(req, res, next) {
    debug("in email_verification route");

    return res.status(200).json({
      "message": "User verified."
    });
  });

  router.route("/email_verification")
  .get(verifyEmail, function(req, res, next) {
    debug("in email_verification route");
    return res.status(200).json({
      "message": "User verified."
    });
  });

  router.route("/change_password")
  .put(Authorize.role("user"), authenticate, function(req, res, next) {
    debug("in change_password route");
    return res.status(200).json({
      "message": "Password updated successfully."
    });
  });

  router.route("/email_reset")
  .put(function(req, res, next) {
    debug("in email_reset route");
    generatePasswordReset(req, res, next);
    return res.status(200).json({"message": "Password reset email sent."});
  });

  router.route("/signout")
  .put(function(req, res, next) {
    if (tokenUtils.expire(req.query.token)) {
      return res.status(200).json({
        "message": "User has been successfully logged out"
      });
    } else {
      return next(new UnauthorizedAccessError("401", {message: 'cannot expire token'}));
    }
  });

  router.route("/signin")
  .post(authenticate, function(req, res, next) {
    return res.status(200).json(req.currentUser);
  });

  router.route("/signup")
  .post(createUser, function(req, res, next) {
    return res.status(200).json(req.currentUser);
  });

  router.unless = require("express-unless");
  return router;
};

debug("Loaded authentication_controller.js routes");
