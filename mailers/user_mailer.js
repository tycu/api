// Live handlebars template/editing engine
// http://tryhandlebarsjs.com/

// https://github.com/sendgrid/sendgrid-nodejs/blob/master/examples/mail/mail.js

var debug = require('debug')('controllers:user_mailer:' + process.pid),
    env = process.env.NODE_ENV || "development",
    resetConfig = require('../config/resetConfig.json')[env],
    Handlebars = require('handlebars'),
    path = require("path"),
    fs = require("fs"),
    util = require('util'),
    sg = require('sendgrid')('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'); // TODO get from process.env.SENDGRID_API_KEY


var renderToString = function(source, templateData) {
  var template = Handlebars.compile(source);
  var compiledEmail = template(templateData);
  return compiledEmail;
}

var send = function(request, next) {
  sg.API(request)
  .then(response => {
      debug("email status code: %s", response.statusCode);
      next(null, response);
  })
  .catch(error => {
    debug("sendgrid error");
    debug(error);
    console.log(util.inspect(error, {showHidden: false, depth: null}));
    // The Error is an instance of SendGridError
    // The full response is attached to error.response
    next(error, response);
  });
}


module.exports.sendWelcomeMail = function(user, next) {
  debug("calling sendWelcomeMail");
  // {"user":{"email":"matt@tally.us", "singleUseToken":"asd"},"domain": "http://localhost:8080/"}

  var templateData = {
    "user": user,
    "domain": resetConfig.domain
  },
  filePath = path.join(__dirname, '/templates/welcome_email.handlebars'),
  compiledEmail,
  user,
  email;
  var email = user.email;

  fs.readFile(filePath, function(err, data){
    if (!err) {
      var source = data.toString();
      compiledEmail = renderToString(source, templateData);

      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [
            {
              to: [
                {
                  email: email
                }
              ],
              subject: 'Welcome to Tally.us!'
            }
          ],
          from: {
            email: 'welcome@tally.us'
          },
          content: [
            {
              type: 'text/html',
              value: compiledEmail
            }
          ]
        }
      });
      send(request, function(err, response) {
        return next(err, response);
      });
    } else {
      debug("handlebar template load error:");
      debug(err);
    }
  });
};


module.exports.sendConfirmMail = function(user, next) {
  debug("calling sendConfirmMail");

  // {"user":{"email":"matt@tally.us", "singleUseToken":"asd"},"domain": "http://localhost:8080/"}

  var templateData = {
    "user": user,
    "domain": resetConfig.domain
  },
  filePath = path.join(__dirname, '/templates/confirm_email.handlebars'),
  compiledEmail,
  user,
  email;
  var email = user.email;

  fs.readFile(filePath, function(err, data){
    if (!err) {
      var source = data.toString();

      compiledEmail = renderToString(source, templateData);
      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [
            {
              to: [
                { email: user.email }
              ],
              subject: 'Tally.us - Please verify your email address.'
            }
          ],
          from: { email: 'welcome@tally.us' },
          content: [
            { type: 'text/html',
              value: compiledEmail
            }
          ]
        }
      });
      send(request, function(err, response) {
        return next(err, response);
      });
    } else {
      debug("handlebar template load error:");
      debug(err);
    }
  });
};


module.exports.sendPasswordResetEmail = function(user, next) {
  debug("calling sendPasswordResetEmail");

  // {"user":{"email":"matt@tally.us", "singleUseToken":"asd"},"domain": "http://localhost:8080/"}

  var templateData = {
    "user": user,
    "domain": resetConfig.domain
  },
  filePath = path.join(__dirname, '/templates/reset_password.handlebars'),
  compiledEmail,
  user,
  email;
  var email = user.email;

  fs.readFile(filePath, function(err, data){
    if (!err) {
      var source = data.toString();

      compiledEmail = renderToString(source, templateData);
      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [
            {
              to: [
                { email: user.email }
              ],
              subject: 'Tally.us - Password Reset Request Received'
            }
          ],
          from: { email: 'passwordReset@tally.us' },
          content: [
            {
              type: 'text/html',
              value: compiledEmail
            }
          ]
        }
      });
      send(request, function(err, response) {
        return next(err, response);
      });
    } else {
      debug("handlebar template load error:");
      debug(err);
    }
  });
};

module.exports.sendPasswordChangeAlert = function(user, next) {
  debug("calling sendPasswordChangeAlert");

  // {"user":{"email":"matt@tally.us", "singleUseToken":"asd"},"domain": "http://localhost:8080/"}

  var templateData = {
    "user": user,
    "domain": resetConfig.domain
  },
  filePath = path.join(__dirname, '/templates/password_change_notification.handlebars'),
  compiledEmail,
  user,
  email;
  var email = user.email;

  fs.readFile(filePath, function(err, data){
    if (!err) {
      var source = data.toString();

      compiledEmail = renderToString(source, templateData);
      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [
            {
              to: [
                { email: user.email }
              ],
              subject: 'Tally.us - Password Change Notification'
            }
          ],
          from: { email: 'passwordChange@tally.us' },
          content: [
            {
              type: 'text/html',
              value: compiledEmail
            }
          ]
        }
      });
      send(request, function(err, response) {
        return next(err, response);
      });
    } else {
      debug("handlebar template load error:");
      debug(err);
    }
  });
}
