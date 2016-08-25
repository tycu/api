'use strict';

module.exports = {
  up: function (queryInterface) { // NOTE can receive(, Sequelize)
    const seedModel = require('../seed_data/events_seed.js'),
          instances = [];
    let instanceObject,
        supports,
        opposes;

    for (const k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];

        // console.log('instanceObject', instanceObject);
        supports = instanceObject.supportPacs;
        opposes = instanceObject.opposePacs;

        for (let i = 0; i < supports.length; i++) {
          instances.push({
          support: true,
          eventId: parseInt(instanceObject.iden, 10),
          pacId: parseInt(supports[i], 10),
          createdAt: new Date(),
          updatedAt: new Date()
          });
        }
        // console.log('supports', supports);
        for (let i = 0; i < opposes.length; i++) {
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

  down: function (queryInterface) { // NOTE can receive(, Sequelize)
    return queryInterface.bulkDelete('PacEvents', null, {});
  }
};
