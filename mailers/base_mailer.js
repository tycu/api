const debug = require('debug')('controllers:user_mailer:' + process.pid),
      env = process.env.NODE_ENV || "development",
      Handlebars = require('handlebars'),
      path = require("path"),
      fs = require("fs"),
      sendGridKey = process.env.SENDGRID_API_KEY || require('../config/sendgridConfig.json')[env]['ApiKey'],
      sg = require('sendgrid')(sendGridKey);


module.exports.sg = sg;

module.exports.renderToString = function(source, templateData) {
  const template = Handlebars.compile(source);
  const compiledEmail = template(templateData);
  return compiledEmail;
};

module.exports.send = function(request, next) {
  debug('calling send!');
  if (sendGridKey === undefined) {
    throw "sendgrid key not found! check env loading";
  }

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

module.exports.checkTest = function() {
  if (env === 'test') {
    return false;
  }
}
