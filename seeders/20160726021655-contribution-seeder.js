'use strict';

module.exports = {
  up: function (queryInterface) { // NOTE can receive(, Sequelize)
    const seedModel = require('../seed_data/contributions_seed.js'),
          instances = [];

    let instanceObject;

    for (const k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        // console.log('instanceObject', instanceObject);
        const donationAmount = parseInt(instanceObject.amount, 10) * 100;

        instances.push({
          // id: parseInt(instanceObject.iden, 10),
          chargeUuid: instanceObject.chargeId,
          donationAmount: donationAmount,
          feeAmount: (donationAmount * 0.15),
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

  down: function (queryInterface) { // NOTE can receive(, Sequelize)
    return queryInterface.bulkDelete('Contributions', null, {});
  }
};
