// Live handlebars template/editing engine
// http://tryhandlebarsjs.com/
// https://github.com/sendgrid/sendgrid-nodejs/blob/master/examples/mail/mail.js

const debug = require('debug')('controllers:contribution_mailer:' + process.pid),
      path = require("path"),
      fs = require("fs"),
      baseMailer = require('./base_mailer');

module.exports.sendDonationReceivedMail = function(contribution, eventPolData, email, next) {
  if (baseMailer.checkTest() === false) {
    return false;
  }

  // {"donationAmount": "53", "support": "support of","headline": "Huge news event","politicianName": "Donald Trump","email": "matt@tally"}

  const politicianName = eventPolData.Politician.firstName + ' ' + eventPolData.Politician.lastName,
        templateData = {
          "donationAmount": contribution.donationAmount / 100,
          "support": contribution.support ? 'support of' : 'opposition to',
          "headline": eventPolData.headline,
          "politicianName": politicianName,
          "email": email
        },
        filePath = path.join(__dirname, '/templates/donation_received.handlebars');

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
              subject: 'Tally.us - Thank you for Your Donation'
            }
          ],
          from: { email: 'info@tally.us' },
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
