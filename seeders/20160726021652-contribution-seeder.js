'use strict';
var fs   = require("fs");
var path = require("path");

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedModel = require('../seed_data/contributions_seed.js');
    // console.log('userSeed', seedModel);
    var instances = [];
    var instanceObject;

    for (var k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        console.log('instanceObject', instanceObject);

        instances.push({
          charge_uuid: instanceObject.chargeId,
          amount: instanceObject.amount,
          // user_id: instanceObject.user,
          // event_id: instanceObject.event,
          // pac_id: instanceObject.pac,
          support: instanceObject.support,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('Contributions', instances, {} );
  },

  down: function (queryInterface, Sequelize) {
  //   return queryInterface.bulkDelete('Contributions', null, {});
  }
};
