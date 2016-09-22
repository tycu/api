"use strict";

const debug = require('debug')('app:tokenUtils:' + process.pid),
      path = require('path'),
      redis = require("redis"),
      client = redis.createClient(),
      _ = require("lodash"),
      env = process.env.NODE_ENV || "development",
      config = require("../config/jwtOptions.json")[env],
      jsonwebtoken = require("jsonwebtoken"),
      TOKEN_EXPIRATION = '5h',
      TOKEN_EXPIRATION_SEC = 18000,
      UnauthorizedAccessError = require(path.join(__dirname, '../', 'errors', 'UnauthorizedAccessError.js')),
      resetConfig = require('../config/resetConfig.json')[env],
      crypto = require('crypto');

client.on('error', function (err) {
  debug("error from tokenUtils %s", err);
});

client.on('connect', function () {
  debug("Redis successfully connected");
});

const expiresWithinHour = function(expAt) {
  return ((expAt - Date.now() / 3600000)) < 1;
}

module.exports.fetch = function(headers) {
  debug("in exports.fetch");
  // debug(headers.authorization)
  let authorization,
      part;

  if (headers && headers.authorization) {
    authorization = headers.authorization;
    part = authorization.split(' ');
    if (part.length === 2) {
      part[1];
      return part[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports.create = function(user, req, res, next, doesExpire) {
  debug("Create token");

  if (_.isEmpty(user)) {
    return next(new Error('User data cannot be empty.'));
  }

  const data = {
    id: user.id,
    email: user.email,
    refreshToken: user.refreshToken,
    token: jsonwebtoken.sign({
      id: user.id,
      email: user.email,
      refreshToken: user.refreshToken,
      randSeed: Math.random()
    }, config.secret, {
      expiresIn: TOKEN_EXPIRATION
    }),
    role: user.role
  };

  const decoded = jsonwebtoken.decode(data.token);
  data.token_exp = decoded.exp;
  data.token_iat = decoded.iat;

  debug("Token generated for email: %s, token: %s, role: %s", data.email, data.token, data.role);

  client.set(data.token, JSON.stringify(data), function (err, reply) {
    if (err) {
      return next(new Error(err));
    }

    if (reply) {
      client.expire(data.token, TOKEN_EXPIRATION_SEC, function (err, reply) {
        if (err) {
          return next(new Error(err)); // "Can not set the expire value for the token key"
        }
        if (reply) {
          if (doesExpire) {
            res.currentUser = data;
            debug('before calling res.currentUser');
            debug(res.currentUser);
            return res.status(200).send(res.currentUser);
          }
          else {
            req.currentUser = data;
            next(); // we have succeeded
          }
        } else {
          return next(new Error('Expiration not set on redis'));
        }
      });
    }
    else {
      return next(new Error('Token not set in redis'));
    }
  });
  return data;
};

module.exports.retrieve = function (id, done) {
  debug("Calling retrieve for token: %s", id);

    if (_.isNull(id)) {
      return done(new Error("token_invalid"), {
        "message": "Invalid token"
      });
    }

    client.get(id, function (err, reply) {
      if (err) {
        return done(err, {
          "message": err
        });
      }
      if (_.isNull(reply)) {
        return done(new Error("token_invalid"), {
          "message": "Token does not exist, are you sure it has not expired or been revoked?"
        });
      } else {
        const data = JSON.parse(reply);
        debug("User data fetched from redis store for email: %s", data.email);

        if (_.isEqual(data.token, id)) {
          return done(null, data);
        } else {
          return done(new Error("token_doesnt_exist"), {
            "message": "Token does not exist, login into the system so it can generate new token."
          });
        }
      }
  });
};

module.exports.verifyEmail = function(existingUser, req, res, next) {
  debug("Verifying email address/single use emailConfirmToken");

  const emailConfirmToken = req.query.single_use_token,
        decipher = crypto.createDecipher('aes256', resetConfig.verifyReset);
  let decrypted = decipher.update(emailConfirmToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  const isDecrypted = decrypted === existingUser.email;
  debug("isDecrypted: %s", isDecrypted);

  if (isDecrypted) {
    return next(existingUser, null);
  } else {
    return next(existingUser, new Error("token_doesnt_exist"), {
      "message": "Cannot validate user email."
    });
  }
};

module.exports.verifyAuth = function(req, res, next) {
  debug("Verifying token");
  const verifyToken = exports.fetch(req.headers);
  jsonwebtoken.verify(verifyToken, config.secret, function (err) { // NOTE could be (err, decode)
    if (err) {
      req.currentUser = undefined;
      return next(new UnauthorizedAccessError("401", {message: 'jwt must be provided'}));
    }
    exports.retrieve(verifyToken, function (err, data) {
      if (err) {
        req.currentUser = undefined;
        return next(new UnauthorizedAccessError("401", {message: 'invalid_token or ?'}));
      }

      const doesExpire = expiresWithinHour(data.token_exp);
      // NOTE to reduce DB lookups
      if (doesExpire) {
        exports.expire(verifyToken);
        exports.create(req.currentUser, req, res, next, doesExpire)
      } else {
        return res.status(200).send(req.currentUser);
      }
    });
  });
};

module.exports.expire = function (token) {
  debug("Expiring token: %s", token);

  if (token !== null) {
    client.expire(token, 0);
  }
  return token !== null;
};

module.exports.middleware = function () {
  const func = function (req, res, next) {
    debug('in token middleware');
    const token = exports.fetch(req.headers);

    exports.retrieve(token, function (err, data) {
      if (err) {
        req.currentUser = undefined;
        return next(new UnauthorizedAccessError("invalid_token", data));
      } else {
        req.currentUser = _.merge(req.currentUser, data);
        debug(req.currentUser);
        next();
      }
    });
  };
  func.unless = require("express-unless");
  return func;
};

module.exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
module.exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;

debug("Loaded tokenUtils");
