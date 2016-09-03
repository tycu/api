// Live handlebars template/editing engine
// http://tryhandlebarsjs.com/
// https://github.com/sendgrid/sendgrid-nodejs/blob/master/examples/mail/mail.js

const debug = require('debug')('controllers:user_mailer:' + process.pid),
      env = process.env.NODE_ENV || "development",
      resetConfig = require('../config/resetConfig.json')[env],
      Handlebars = require('handlebars'),
      path = require("path"),
      fs = require("fs"),
      sendGridKey = process.env.SENDGRID_API_KEY || require('../config/sendgridConfig.json'),
      sg = require('sendgrid')(sendGridKey);


const renderToString = function(source, templateData) {
  const template = Handlebars.compile(source);
  const compiledEmail = template(templateData);
  return compiledEmail;
};

const send = function(request, next) {
  sg.API(request)
  .then(response => {
      debug("email status code: %s", response.statusCode);
      next(null, response);
  })
  .catch(error => {

    // TODO throw error from sendgrid.

    // debug("sendgrid error");
    // debug(error);
    // console.log(util.inspect(error, {showHidden: false, depth: null}));
    // The Error is an instance of SendGridError
    // The full response is attached to error.response
    next(error, response);
  });
};

const checkTest = function() {
  if (env === 'test') {
    return false;
  }

}

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
  if (checkTest() === false) {
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

      compiledEmail = renderToString(source, templateData);
      request = sg.emptyRequest({
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
  if (checkTest() === false) {
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

      compiledEmail = renderToString(source, templateData);
      request = sg.emptyRequest({
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
  if (checkTest() === false) {
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

      compiledEmail = renderToString(source, templateData);
      request = sg.emptyRequest({
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
      send(request, function(err, response) {
        return next(err, response);
      });
    } else {
      debug("handlebar template load error:");
      debug(err);
    }
  });
};
