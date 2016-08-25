'use strict';

module.exports = {
  up: function (queryInterface) { // NOTE can receive(, Sequelize)
    const seedModel = require('../seed_data/events_seed.js'),
          instances = [];

    let instanceObject;

    for (const k in seedModel){
      if (seedModel.hasOwnProperty(k)) {
        // console.log('key', k);
        // console.log('val', seedModel[k]);
        instanceObject = seedModel[k];
        // console.log('instanceObject', instanceObject);

        instances.push({
          // id: parseInt(instanceObject.iden, 10),
          imageAttribution: instanceObject.imageAttribution,
          imageUrl: instanceObject.imageUrl,
          politicianId: instanceObject.politician,
          headline: instanceObject.headline,
          summary: instanceObject.summary,
          isPinned: false,
          isPublished: true,
          // instanceObject.tweets,
          // instanceObject.supportPacs,
          // instanceObject.opposePacs,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    // console.log('instances', instances);
    // console.log('instances.length', instances.length);
    return queryInterface.bulkInsert('Events', instances, {});
  },

  down: function (queryInterface) { // NOTE can receive(, Sequelize)
    return queryInterface.bulkDelete('Events', null, {});
  }
};
