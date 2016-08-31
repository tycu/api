const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5001'),
      models    = require('../models/index'),
      tokenUtils = require("../services/tokenUtils");

var data = {},
    token;

var seq_test = function(next) {
  return function () {

    before(function(done) {
      const email = 'testEmail+1@tally.us',
            password = 'coolPassword1';

      const newUser = models.User.build({
        email: email,
        loginCount: 1,
        failedLoginCount: 0,
        lastLoginAt: new Date(),
        currentLoginAt: new Date(),
        currentLoginIp: '127.0.0.1',
        singleUseToken: '12345',
        role: 'admin'
      })
      .setPassword(password, function(newUser, err) {
        newUser.save(function(newUser, err) {})
        .then(function(newUser, err) {
          data = tokenUtils.create(newUser, {}, {}, next);
          token = data.token;
          done();
        });
      });
    });

    after(function(done) {
      models.User.findAll({attributes: ['id'], paranoid: false})
      .then(function(allUsers){
        var ids = [];
        allUsers.forEach(function(user) {
          ids.push(user.dataValues.id)
        })
        models.User.destroy({force: true, where: {id: ids}});
        done()
      })
    });

    next();
  };
}

describe("Controller Tests", seq_test(function () {
  // TODO is leaving created user behind, needs cleanup
  // require("./controller_tests/authentication_controller_test.js")(models, api);

  // TODO needs Authorize.js handling:
  require("./controller_tests/users_controller_test.js")(models, api, data);

  // TODO needs post/put methods:
  require("./controller_tests/politician_photos_controller_test.js")(models, api, token);
  require("./controller_tests/pac_events_controller_test.js")(models, api, token);
  require("./controller_tests/pacs_controller_test.js")(models, api, token);
  require("./controller_tests/ping_test.js")(models, api, token);
  require("./controller_tests/events_controller_test.js")(models, api, token);
  require("./controller_tests/politicians_controller_test.js")(models, api, token);
}));
