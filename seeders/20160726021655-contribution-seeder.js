'use strict';
var fs   = require("fs");
var path = require("path");

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedModel = require('../seed_data/contributions_seed.js');
    // console.log('seedModel', seedModel);
    var instances = [];
    var instanceObject;

    for (var k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        // console.log('instanceObject', instanceObject);

        instances.push({
          id: parseInt(instanceObject.iden, 10),
          chargeUuid: instanceObject.chargeId,
          amount: parseInt(instanceObject.amount, 10),
          userId: parseInt(instanceObject.user, 10),
          eventId: parseInt(instanceObject.event, 10),
          pacId: parseInt(instanceObject.pac, 10),
          support: instanceObject.support,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('Contributions', instances, {} );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Contributions', null, {});
  }
};
