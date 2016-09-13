// Live handlebars template/editing engine
// http://tryhandlebarsjs.com/
// https://github.com/sendgrid/sendgrid-nodejs/blob/master/examples/mail/mail.js

const debug = require('debug')('controllers:user_mailer:' + process.pid),
      env = process.env.NODE_ENV || "development",
      resetConfig = require('../config/resetConfig.json')[env],
      path = require("path"),
      fs = require("fs"),
      baseMailer = require('./base_mailer');

module.exports.sendWelcomeMail = function(user, next) {
  if (checkTest() === false) {
    return false;
  }

  debug("calling sendWelcomeMail");
  // {"user":{"email":"matt@tally.us", "singleUseToken":"asd"},"domain": "http://localhost:8080/"}

  const templateData = {
          "user": user,
          "domain": resetConfig.domain
        },
        filePath = path.join(__dirname, '/templates/welcome_email.handlebars'),
        email = user.email;

  var compiledEmail,
      source,
      request;

  fs.readFile(filePath, function(err, data) {
    if (!err) {
      source = data.toString();
      compiledEmail = baseMailer.renderToString(source, templateData);

      var request = baseMailer.sg.emptyRequest({
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
      baseMailer.send(request, function(err, response) {
        return next(err, response);
      });
    } else {
      debug("handlebar template load error:");
      debug(err);
    }
  });
};


module.exports.sendConfirmMail = function(user, next) {
  if (baseMailer.checkTest() === false) {
    return false;
  }

  debug("calling sendConfirmMail");

  // {"user":{"email":"matt@tally.us", "singleUseToken":"asd"},"domain": "http://localhost:8080/"}

  const templateData = {
          "user": user,
          "domain": resetConfig.domain
        },
        filePath = path.join(__dirname, '/templates/confirm_email.handlebars'),
        email = user.email;

  var compiledEmail,
      source,
      request;

  fs.readFile(filePath, function(err, data) {
    if (!err) {
      source = data.toString();

      compiledEmail = baseMailer.renderToString(source, templateData);
      request = baseMailer.sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [
            {
              to: [
                { email: email }
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
      baseMailer.send(request, function(err, response) {
        return next(err, response);
      });
    } else {
      debug("handlebar template load error:");
      debug(err);
    }
  });
};


module.exports.sendPasswordResetEmail = function(user, next) {
  if (baseMailer.checkTest() === false) {
    return false;
  }
  debug("calling sendPasswordResetEmail");

  // {"user":{"email":"matt@tally.us", "singleUseToken":"asd"},"domain": "http://localhost:8080/"}

  const templateData = {
          "user": user,
          "domain": resetConfig.domain
        },
        filePath = path.join(__dirname, '/templates/reset_password.handlebars'),
        email = user.email;

  var compiledEmail,
      source,
      request;

  fs.readFile(filePath, function(err, data) {
    if (!err) {
      source = data.toString();

      compiledEmail = baseMailer.renderToString(source, templateData);
      request = baseMailer.sg.emptyRequest({
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
      baseMailer.send(request, function(err, response) {
        return next(err, response);
      });
    } else {
      debug("handlebar template load error:");
      debug(err);
    }
  });
};

module.exports.sendPasswordChangeAlert = function(user, next) {
  if (baseMailer.checkTest() === false) {
    return false;
  }
  debug("calling sendPasswordChangeAlert");

  // {"user":{"email":"matt@tally.us", "singleUseToken":"asd"},"domain": "http://localhost:8080/"}

  const templateData = {
          "user": user,
          "domain": resetConfig.domain
        },
        filePath = path.join(__dirname, '/templates/password_change_notification.handlebars'),
        email = user.email;

  var compiledEmail,
      source,
      request;

  fs.readFile(filePath, function(err, data) {
    if (!err) {
      source = data.toString();

      compiledEmail = baseMailer.renderToString(source, templateData);
      request = baseMailer.sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [
            {
              to: [
                { email: email }
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
      baseMailer.send(request, function(err, response) {
        return next(err, response);
      });
    } else {
      debug("handlebar template load error:");
      debug(err);
    }
  });
};
