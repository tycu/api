"use strict";

const debug = require('debug')('app:tokenUtils:' + process.pid),
      path  = require('path'),
      UnauthorizedAccessError = require(path.join(__dirname, '../', 'errors', 'UnauthorizedAccessError.js'));

module.exports.role = function(role) {
  return function(req, res, next) {
    debug("above check for match");
    // debug(parseInt(req.currentUser.id, 10) === parseInt(req.params.id, 10));
    // debug((req.currentUser && req.currentUser.role == role && parseInt(req.currentUser.id, 10) === parseInt(req.params.id, 10)));
    // debug(req.currentUser.role == role);
    debug(req.currentUser.role);
    debug(role);

    if (!req.currentUser) {
      return next(new UnauthorizedAccessError("403", {
        message: 'Cannot access resource.'
      }));
    }
    if (req.currentUser && req.currentUser.role === 'admin') {
      return next();
    }
    else if (req.currentUser.role === role && (parseInt(req.currentUser.id, 10) === parseInt(req.params.id, 10)) || (req.currentUser.email === req.body.email)) {
      return next();
    }
    else {
      req.user = null;
      return next(new UnauthorizedAccessError("403", {
        message: 'Cannot access resource.'
      }));
    }
  };
};

debug("Loaded Authorize");
