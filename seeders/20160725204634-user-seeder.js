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
          // NOTE don't seed user so we can init postgres sequence
          // see stuff about sequelize issues with PG sequence
          // id: parseInt(instanceObject.iden, 10),
          name: instanceObject.name,
          facebookUuid: instanceObject.facebookId,
          email: instanceObject.email,
          createdAt:  new Date(),
          updatedAt: new Date(),
          cryptedPassword: ''
        });
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('Users', instances, {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
