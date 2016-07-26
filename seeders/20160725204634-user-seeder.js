'use strict';
var fs   = require("fs");
var path = require("path");

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedModel = require('../seed_data/users_seed.js');
    var instances = [];
    var instanceObject;

    for (var k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        instances.push({
          id: instanceObject.iden,
          name: instanceObject.name,
          facebook_uuid: instanceObject.facebookId,
          email: instanceObject.email,
          created_at:  new Date(),
          updated_at: new Date(),
          crypted_password: '',
          password_salt: '',
          persistence_token: '',
          single_access_token: '',
          perishable_token: ''
        });
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('Users', instances, {});
  },

  down: function (queryInterface, Sequelize) {
    // return queryInterface.bulkDelete('Users', null, {});
  }
};
