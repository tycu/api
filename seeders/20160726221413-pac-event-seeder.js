'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedModel = require('../seed_data/events_seed.js');
    // console.log('seedModel', seedModel);
    var instances = [];
    var instanceObject;
    var supports;
    var opposes;

    for (var k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];

        // console.log('instanceObject', instanceObject);
        supports = instanceObject['supportPacs'];
        opposes = instanceObject['opposePacs'];

        for (var i = 0; i < supports.length; i++) {
          instances.push({
          support: true,
          eventId: parseInt(instanceObject.iden, 10),
          pacId: parseInt(supports[i], 10),
          createdAt: new Date(),
          updatedAt: new Date()
          });
        }
        // console.log('supports', supports);
        for (var i = 0; i < opposes.length; i++) {
          instances.push({
          support: false,
          eventId: parseInt(instanceObject.iden, 10),
          pacId: parseInt(opposes[i], 10),
          createdAt: new Date(),
          updatedAt: new Date()
          });
        }
        // console.log('opposes', opposes);
      }
    }
    // console.log('instances', instances);
    return queryInterface.bulkInsert('PacEvents', instances, {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('PacEvents', null, {});
  }
};
