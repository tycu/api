const should    = require('should'),
      assert    = require('assert'),
      supertest = require('supertest'),
      api       = supertest('http://localhost:5000'),
      models    = require('../models/index');

var seq_test = function(next) {
  return function () {
    next();
  };
}

describe("Controller Tests", seq_test(function () {
  require("./controller_tests/authentication_controller_test.js")(models, api);
  require("./controller_tests/events_controller_test.js")(models, api);
  require("./controller_tests/pac_events_controller_test.js")(models, api);
  require("./controller_tests/pacs_controller_test.js")(models, api);
  require("./controller_tests/ping_test.js")(models, api);
  require("./controller_tests/politicians_controller_test.js")(models, api);
  require("./controller_tests/politician_photos_controller_test.js")(models, api);
  require("./controller_tests/users_controller_test.js")(models, api);
}));
