'use strict'

module.exports = function(app, redis) {

  app.get('/', function(req, res) {
    res.json({
      'revitalizingDemocracy': true
    });
  });

}